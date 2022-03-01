import type { Employee } from '../src/interfaces/employee.interface'

export const createOrg = () => {
  const will: Employee = {
    name: 'Will Turner',
    subordinates: [],
    uniqueId: 15,
  }

  const tina: Employee = {
    name: 'Tina Teff',
    subordinates: [will],
    uniqueId: 14,
  }

  const bob: Employee = {
    name: 'Bob Saget',
    subordinates: [tina],
    uniqueId: 8,
  }

  const mary: Employee = {
    name: 'Mary Blue',
    subordinates: [],
    uniqueId: 7,
  }

  const cass: Employee = {
    name: 'Cassandra Reynolds',
    subordinates: [mary, bob],
    uniqueId: 6,
  }

  const sarah: Employee = {
    name: 'Sarah Donald',
    subordinates: [cass],
    uniqueId: 2,
  }

  const thomas: Employee = {
    name: 'Thomas Brown',
    subordinates: [],
    uniqueId: 13,
  }

  const harry: Employee = {
    name: 'Harry Tobs',
    subordinates: [thomas],
    uniqueId: 9,
  }

  const george: Employee = {
    name: 'George Carrey',
    subordinates: [],
    uniqueId: 10,
  }

  const gary: Employee = {
    name: 'Gary Styles',
    subordinates: [],
    uniqueId: 11,
  }

  const tyler: Employee = {
    name: 'Tyler Simpson',
    subordinates: [harry, george, gary],
    uniqueId: 3,
  }

  const bruce: Employee = {
    name: 'Bruce Willis',
    subordinates: [],
    uniqueId: 4,
  }

  const sophia: Employee = {
    name: 'Sophie Turner',
    subordinates: [],
    uniqueId: 12,
  }

  const georgina: Employee = {
    name: 'Georgina Flangy',
    subordinates: [sophia],
    uniqueId: 5,
  }

  const root: Employee = {
    name: 'Mark Zuckerberg',
    subordinates: [sarah, tyler, bruce, georgina],
    uniqueId: 1,
  }

  return { root, sarah, tyler, bruce, georgina, harry, george, gary, thomas, mary, cass, tina, will, bob, sophia }
}
