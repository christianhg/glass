import * as React from 'react';
import { render } from 'react-dom';
import {
  actions,
  DefaultContext,
  Machine as createMachine,
  StateSchema,
  StateValue,
  EventObject,
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
        amount: (ctx, event) => ctx.amount + 1,
      }),
    },
    guards: {
      glassIsFull: (ctx, event) => ctx.amount >= 10,
    },
  },
);

class Glass extends React.Component<{}, { glassState: StateValue }> {
  constructor(props) {
    super(props);
    this.state = {
      glassState: glassMachine.initialState.value,
    };
  }

  transition(event: GlassEvent) {
    const nextState = glassMachine.transition(this.state.glassState, event);
    nextState.actions.forEach(action => {
      if (action.exec) {
        action.exec(nextState.context, event);
      }
    });
    this.setState({
      glassState: nextState.value,
    });
  }

  render() {
    return (
      <div>
        <span>The glass is {this.state.glassState}</span>
        <button onClick={() => this.transition({ type: 'FILL' })}>Fill</button>
      </div>
    );
  }
}

render(<Glass />, document.getElementById('root'));
