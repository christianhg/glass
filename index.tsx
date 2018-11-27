import * as React from 'react';
import { render } from 'react-dom';
import {
  actions,
  DefaultContext,
  Machine as createMachine,
  StateSchema,
  EventObject,
  State,
} from 'xstate';
import { Machine } from 'xstate/lib/types';
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

const glassMachine: Machine<
  GlassContext,
  GlassSchema,
  GlassEvent
> = createMachine<GlassContext, GlassSchema, GlassEvent>(
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

  transition(event: GlassEvent, context: GlassContext) {
    const nextState = glassMachine.transition(this.state.glass, event, context);

    nextState.actions.forEach(action => {
      if (action.exec) {
        action.exec(nextState.context, event);
      }
    });

    this.setState({
      glass: nextState,
    });
  }

  render() {
    return (
      <div>
        <span>The glass is {this.state.glass.value}</span>
        <button
          onClick={() =>
            this.transition({ type: 'FILL' }, this.state.glass.context)
          }
        >
          Fill
        </button>
      </div>
    );
  }
}

render(<Glass />, document.getElementById('root'));
