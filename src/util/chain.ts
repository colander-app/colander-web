export const chain =
  <T>(...modifiers: Array<(input: T) => T>) =>
  (input: T): T =>
    modifiers.reduce<T>((final, current) => current(final), input)
