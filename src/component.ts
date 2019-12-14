import State from './state2';

export default interface Component {
  tick(state: State, now: number, delta: number);
}
