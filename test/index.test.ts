import { describe, expect, it } from 'vitest'
import EmployOrgApp from '../src'
import type { Employee, EmployeePosition } from '../src/interfaces/employee.interface'
import { createOrg } from './test-sample'

/**
 * Mark Zuckerberg (1)
 * ┣ Sarah Donald (2)
 * ┃  ┗ Cassandra Reynolds (3)
 * ┃    ┣ Mary Blue (4)
 * ┃    ┗ Bob Saget (4)
 * ┃      ┗ Tina Teff (5)
 * ┃        ┗ Will Turner (6)
 * ┣ Tyler Simpson (2)
 * ┃  ┣ Harry Tobs (3)
 * ┃  ┃ ┗ Thomas Brown (4)
 * ┃  ┣ George Carrey (3)
 * ┃  ┣ Gary Styles (3)
 * ┣ Bruce Willis (2)
 * ┣ Georgina Flangy (2)
 * ┃  ┗ Sophie Turner (3)
 */
describe('Normal use cases', () => {
  it('Instantiable with the CEO', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    expect(app.ceo).toMatchObject(org.root)
  })

  it('Be able to find Employee by ID', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const georgeInApp = app.findId(org.george.uniqueId)
    expect(georgeInApp?.employee).toMatchObject(org.george)
  })

  /**
   * When an Bob Saget is moved to a new supervisor Georgina,
   * Bob's existing subordinates (Tina Teff)
   * will become the subordinate of Cassandra - Bob's old supervisor.
   */
  it('Georgina (3) > Bob (4)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]
    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))
  })

  it('UNDO Georgina (3) > Bob (4)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates]
    const bobOldSubordinates = [...bob.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.undo()
    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).not.toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).toContainEqual(org.bob)
    expect(bob.subordinates).toEqual(expect.arrayContaining(bobOldSubordinates))
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(bobOldSupervisorSubs))
  })

  it('REDO Georgina (3) > Bob (4)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]
    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.undo()
    app.redo()
    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))
  })

  it('Georgina (3) > Bob (4), Bruce (2) > Harry (3)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]

    const {
      employee: harry,
      supervisor: harryOldSupervisor,
    } = app.findId(org.harry.uniqueId) as EmployeePosition
    const harryOldSupervisorSubs = [...harryOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.harry.uniqueId)
    const harryOldSubordinates = [...harry.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.move(org.harry.uniqueId, org.bruce.uniqueId)

    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))

    const {
      employee: bruce,
    } = app.findId(org.bruce.uniqueId) as EmployeePosition
    expect(bruce.subordinates).toContainEqual(org.harry)
    expect(harryOldSupervisor.subordinates).not.toContainEqual(org.harry)
    const expectedHarryOldSupervisorSubs = [...harryOldSupervisorSubs, ...harryOldSubordinates]
    expect(harryOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedHarryOldSupervisorSubs))
  })

  it('UNDO Georgina (3) > Bob (4), Bruce (2) > Harry (3)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)

    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]

    const {
      employee: harry,
      supervisor: harryOldSupervisor,
    } = app.findId(org.harry.uniqueId) as EmployeePosition
    const harryOldSupervisorSubs = [...harryOldSupervisor.subordinates]
    const harryOldSubordinates = [...harry.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.move(org.harry.uniqueId, org.bruce.uniqueId)
    app.undo()

    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))

    const {
      employee: bruce,
    } = app.findId(org.bruce.uniqueId) as EmployeePosition
    expect(bruce.subordinates).not.toContainEqual(org.harry)
    expect(harryOldSupervisor.subordinates).toContainEqual(org.harry)
    expect(harry.subordinates).toEqual(expect.arrayContaining(harryOldSubordinates))
    expect(harryOldSupervisor.subordinates).toEqual(expect.arrayContaining(harryOldSupervisorSubs))
  })

  it('2UNDO Georgina (3) > Bob (4), Bruce (2) > Harry (3)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates]
    const bobOldSubordinates = [...bob.subordinates]

    const {
      employee: harry,
      supervisor: harryOldSupervisor,
    } = app.findId(org.harry.uniqueId) as EmployeePosition
    const harryOldSupervisorSubs = [...harryOldSupervisor.subordinates]
    const harryOldSubordinates = [...harry.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.move(org.harry.uniqueId, org.bruce.uniqueId)
    app.undo()
    app.undo()

    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).not.toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).toContainEqual(org.bob)
    expect(bob.subordinates).toEqual(expect.arrayContaining(bobOldSubordinates))
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(bobOldSupervisorSubs))

    const {
      employee: bruce,
    } = app.findId(org.bruce.uniqueId) as EmployeePosition
    expect(bruce.subordinates).not.toContainEqual(org.harry)
    expect(harryOldSupervisor.subordinates).toContainEqual(org.harry)
    expect(harry.subordinates).toEqual(expect.arrayContaining(harryOldSubordinates))
    expect(harryOldSupervisor.subordinates).toEqual(expect.arrayContaining(harryOldSupervisorSubs))
  })

  it('REDO Georgina (3) > Bob (4), Bruce (2) > Harry (3)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]

    const {
      employee: harry,
      supervisor: harryOldSupervisor,
    } = app.findId(org.harry.uniqueId) as EmployeePosition
    const harryOldSupervisorSubs = [...harryOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.harry.uniqueId)
    const harryOldSubordinates = [...harry.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.move(org.harry.uniqueId, org.bruce.uniqueId)
    app.undo()
    app.redo()

    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))

    const {
      employee: bruce,
    } = app.findId(org.bruce.uniqueId) as EmployeePosition
    expect(bruce.subordinates).toContainEqual(org.harry)
    expect(harryOldSupervisor.subordinates).not.toContainEqual(org.harry)
    const expectedHarryOldSupervisorSubs = [...harryOldSupervisorSubs, ...harryOldSubordinates]
    expect(harryOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedHarryOldSupervisorSubs))
  })

  it('2UNDO + REDO Georgina (3) > Bob (4), Bruce (2) > Harry (3)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)

    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]

    const {
      employee: harry,
      supervisor: harryOldSupervisor,
    } = app.findId(org.harry.uniqueId) as EmployeePosition
    const harryOldSupervisorSubs = [...harryOldSupervisor.subordinates]
    const harryOldSubordinates = [...harry.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.move(org.harry.uniqueId, org.bruce.uniqueId)
    app.undo()
    app.undo()
    app.redo()

    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))

    const {
      employee: bruce,
    } = app.findId(org.bruce.uniqueId) as EmployeePosition
    expect(bruce.subordinates).not.toContainEqual(org.harry)
    expect(harryOldSupervisor.subordinates).toContainEqual(org.harry)
    expect(harry.subordinates).toEqual(expect.arrayContaining(harryOldSubordinates))
    expect(harryOldSupervisor.subordinates).toEqual(expect.arrayContaining(harryOldSupervisorSubs))
  })

  it('2UNDO + 2REDO Georgina (3) > Bob (4), Bruce (2) > Harry (3)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: bob,
      supervisor: bobOldSupervisor,
    } = app.findId(org.bob.uniqueId) as EmployeePosition
    const bobOldSupervisorSubs = [...bobOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.bob.uniqueId)
    const bobOldSubordinates = [...bob.subordinates]

    const {
      employee: harry,
      supervisor: harryOldSupervisor,
    } = app.findId(org.harry.uniqueId) as EmployeePosition
    const harryOldSupervisorSubs = [...harryOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.harry.uniqueId)
    const harryOldSubordinates = [...harry.subordinates]

    app.move(org.bob.uniqueId, org.georgina.uniqueId)
    app.move(org.harry.uniqueId, org.bruce.uniqueId)
    app.undo()
    app.undo()
    app.redo()
    app.redo()

    const {
      employee: georgina,
    } = app.findId(org.georgina.uniqueId) as EmployeePosition
    expect(georgina.subordinates).toContainEqual(org.bob)
    expect(bobOldSupervisor.subordinates).not.toContainEqual(org.bob)
    const expectedBobOldSupervisorSubs = [...bobOldSupervisorSubs, ...bobOldSubordinates]
    expect(bobOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedBobOldSupervisorSubs))

    const {
      employee: bruce,
    } = app.findId(org.bruce.uniqueId) as EmployeePosition
    expect(bruce.subordinates).toContainEqual(org.harry)
    expect(harryOldSupervisor.subordinates).not.toContainEqual(org.harry)
    const expectedHarryOldSupervisorSubs = [...harryOldSupervisorSubs, ...harryOldSubordinates]
    expect(harryOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedHarryOldSupervisorSubs))
  })

  it('Cassandra (3) > Sarah (2)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: sarah,
      supervisor: sarahOldSupervisor,
    } = app.findId(org.sarah.uniqueId) as EmployeePosition
    const sarahOldSupervisorSubs = [...sarahOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.sarah.uniqueId)
    const sarahOldSubordinates = [...sarah.subordinates]
    app.move(org.sarah.uniqueId, org.cass.uniqueId)
    const {
      employee: cass,
    } = app.findId(org.cass.uniqueId) as EmployeePosition
    expect(cass.subordinates).toContainEqual(org.sarah)
    expect(sarahOldSupervisor.subordinates).not.toContainEqual(org.sarah)
    const expectedSarahOldSupervisorSubs = [...sarahOldSupervisorSubs, ...sarahOldSubordinates]
    expect(sarahOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedSarahOldSupervisorSubs))
  })

  it('UNDO Cass (3) > Sarah (4)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: sarah,
      supervisor: sarahOldSupervisor,
    } = app.findId(org.sarah.uniqueId) as EmployeePosition
    const sarahOldSupervisorSubs = [...sarahOldSupervisor.subordinates]
    const sarahOldSubordinates = [...sarah.subordinates]

    app.move(org.sarah.uniqueId, org.cass.uniqueId)
    app.undo()
    const {
      employee: cass,
    } = app.findId(org.cass.uniqueId) as EmployeePosition
    expect(cass.subordinates).not.toContainEqual(org.sarah)
    expect(sarahOldSupervisor.subordinates).toContainEqual(org.sarah)
    expect(sarah.subordinates).toEqual(expect.arrayContaining(sarahOldSubordinates))
    expect(sarahOldSupervisor.subordinates).toEqual(expect.arrayContaining(sarahOldSupervisorSubs))
  })

  it('REDO Cass (3) > Sarah (4)', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const {
      employee: sarah,
      supervisor: sarahOldSupervisor,
    } = app.findId(org.sarah.uniqueId) as EmployeePosition
    const sarahOldSupervisorSubs = [...sarahOldSupervisor.subordinates].filter(sub => sub.uniqueId !== org.sarah.uniqueId)
    const sarahOldSubordinates = [...sarah.subordinates]
    app.move(org.sarah.uniqueId, org.cass.uniqueId)
    app.undo()
    app.redo()
    const {
      employee: cass,
    } = app.findId(org.cass.uniqueId) as EmployeePosition
    expect(cass.subordinates).toContainEqual(org.sarah)
    expect(sarahOldSupervisor.subordinates).not.toContainEqual(org.sarah)
    const expectedSarahOldSupervisorSubs = [...sarahOldSupervisorSubs, ...sarahOldSubordinates]
    expect(sarahOldSupervisor.subordinates).toEqual(expect.arrayContaining(expectedSarahOldSupervisorSubs))
  })
})

describe('Invalid use cases', () => {
  it('Cannot move the CEO', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    expect(() => {
      app.move(org.root.uniqueId, org.bob.uniqueId)
    }).toThrowError('You cannot do that with the CEO, mate!')
  })

  it('Cannot find invalid employee ID', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    const notFoundEmployee = app.findId(2022)
    expect(notFoundEmployee).toEqual(null)
  })

  it('Cannot move invalid employee', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    expect(() => {
      app.move(2022, org.bob.uniqueId)
    }).toThrowError('Employee with id 2022 not found')
  })

  it('Cannot move to self', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    expect(() => {
      app.move(org.bob.uniqueId, org.bob.uniqueId)
    }).toThrowError('Employee cannot supervise themselves, mate!')
  })

  it('Cannot move to self', () => {
    const org = createOrg()
    const app = new EmployOrgApp(org.root)
    expect(() => {
      app.move(org.bob.uniqueId, org.bob.uniqueId)
    }).toThrowError('Employee cannot supervise themselves, mate!')
  })
})
