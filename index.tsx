import * as React from 'react';
import { render } from 'react-dom';
import { Machine, actions } from 'xstate';
const { assign } = actions;

const addWater = assign({
  amount: (ctx, event) => ctx.amount + 1,
});

function glassIsFull(ctx, event) {
  return ctx.amount >= 10;
}

const glassMachine = Machine(
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
    actions: { addWater },
    guards: { glassIsFull },
  },
);

class Glass extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <span>The glass is {glassMachine.initialState.value}</span>;
  }
}

render(<Glass />, document.getElementById('root'));
