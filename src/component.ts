import State from './state2.ts';

export default interface Component {
  tick(state: State, now: number, delta: number);
}
