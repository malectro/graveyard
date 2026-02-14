import State from './state';

export default interface Component {
  tick(state: State, now: number, delta: number);
}
