import * as React from 'react';
import { render } from 'react-dom';
import {
  actions,
  DefaultContext,
  Machine,
  StateSchema,
  EventObject,
  State,
  interpret,
} from 'xstate';
import { StateMachine } from 'xstate/lib/types';
const { assign } = actions;

interface GlassContext extends DefaultContext {
  amount: number;
}

interface GlassSchema extends StateSchema {
  states: {
    empty: {};
    filling: {};
    full: {};
  };
}

interface GlassEvent extends EventObject {
  type: 'FILL';
}

const glassMachine: StateMachine<
  GlassContext,
  GlassSchema,
  GlassEvent
> = Machine<GlassContext, GlassSchema, GlassEvent>(
  {
    id: 'glass',
    context: {
      amount: 0,
    },
    initial: 'empty',
    states: {
      empty: {
        on: {
          FILL: {
            target: 'filling',
            actions: 'addWater',
          },
        },
      },
      filling: {
        on: {
          '': {
            target: 'full',
            cond: 'glassIsFull',
          },
          FILL: {
            target: 'filling',
            actions: 'addWater',
          },
        },
      },
      full: {},
    },
  },
  {
    actions: {
      addWater: assign<GlassContext, GlassEvent>({
        amount: (ctx, event) => {
          console.log(ctx);
          return ctx.amount + 1;
        },
      }),
    },
    guards: {
      glassIsFull: (ctx, event) => ctx.amount >= 10,
    },
  },
);

class Glass extends React.Component<
  {},
  { glass: State<GlassContext, GlassEvent> }
> {
  constructor(props) {
    super(props);
    this.state = {
      glass: glassMachine.initialState,
    };
  }

  interpreter = interpret(glassMachine)
    .onTransition(nextState => {
      this.setState({
        glass: nextState,
      });
    })
    .start();

  render() {
    return (
      <div>
        <span>The glass is {this.state.glass.value}</span>
        <button
          disabled={this.state.glass.value === 'full'}
          onClick={() => this.interpreter.send({ type: 'FILL' })}
        >
          Fill
        </button>
      </div>
    );
  }
}

render(<Glass />, document.getElementById('root'));
