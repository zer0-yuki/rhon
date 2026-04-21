export const enum Precedence {
  LOWEST = 0,
  ASSIGNMENT = 10,
  // logic operation
  LOGICAL_OR = 20,
  LOGICAL_AND = 30,
  BITWISE_OR = 40,
  BITWISE_XOR = 50,
  BITWISE_AND = 60,
  EQUALITY = 70,
  RELATIONA = 80,
  // number operation
  SUM = 90,
  PRODUCT = 100,
  PREFIX = 110,

  CALL = 120,

  MEMBER = 130,
}
