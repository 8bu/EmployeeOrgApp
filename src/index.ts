import type { Employee, EmployeePosition, IEmployeeOrgApp, UndoableAction } from './interfaces/employee.interface'

export default class EmployeeOrgApp implements IEmployeeOrgApp {
  private actionHistory: Array<UndoableAction | null> = [null]
  private latestActionIdx = 0

  public ceo: Employee
  constructor(ceo: Employee) {
    this.ceo = ceo
  }

  /**
     * Find employee node from root (ceo)
  */
  public findId(
    eId: number,
    node: Employee = this.ceo,
    parentNode: Employee = this.ceo,
  ): EmployeePosition | null {
    // Not sure if we should cover this case but I did it anyway.
    if (eId === this.ceo.uniqueId) {
      return {
        employee: this.ceo,
        supervisor: this.ceo,
      }
    }
    else if (node && node.uniqueId === eId) {
      return {
        employee: node,
        supervisor: parentNode,
      }
    }
    else if (node.subordinates.length) {
      let result = null
      node.subordinates.some(sub => (result = this.findId(eId, sub, node)))

      return result
    }
    return null
  }

  public findIdOrThrow(eId: number, node?: Employee, parentNode?: Employee): EmployeePosition {
    const position = this.findId(eId, node, parentNode)
    if (!position)
      throw new Error(`Employee with id ${eId} not found`)

    return position
  }

  public move(eId: number, sId: number): void {
    if (eId === this.ceo.uniqueId)
      throw new Error('You cannot do that with the CEO, mate!')

    // Before execute any move, assume that we have undo several times.
    // So we check if your previous action is not the last item in history
    // then we cut off all redundant actions after it.
    // Now we can push incoming action without duplicating the undo-ed actions.
    if (this.latestActionIdx < this.actionHistory.length - 1) {
      this.actionHistory = this.actionHistory.slice(
        0,
        this.latestActionIdx + 1,
      )
    }

    const { supervisor: cachedSupervisor } = this.findIdOrThrow(eId)

    const _move = (_eId: number, _sId: number): void => {
      const _employeePosition = this.findIdOrThrow(_eId)
      const _supervisorPosition = this.findIdOrThrow(_sId)

      const { employee, supervisor: currentSupervisor } = _employeePosition
      const targetSupervisor = _supervisorPosition.employee
      currentSupervisor.subordinates = currentSupervisor.subordinates.filter(
        e => !(e.uniqueId === _eId),
      )
      targetSupervisor.subordinates.push(employee)
    }

    const exec = () => {
      _move(eId, sId)
    }

    // Undo will roll back exec action
    // In this case, we restore the previous supervisor
    const undo = () => {
      _move(eId, cachedSupervisor.uniqueId)
    }

    const action: UndoableAction = {
      exec,
      undo,
    }
    this.actionHistory.push(action)
    this.latestActionIdx += 1

    exec()
  }

  public undo() {
    // Can't undo if there is no previous action
    if (this.latestActionIdx > 0) {
      this.actionHistory[this.latestActionIdx]?.undo()
      this.latestActionIdx -= 1
    }
  }

  public redo() {
    // Can't redo if current action is latest
    if (this.latestActionIdx < this.actionHistory.length - 1) {
      this.latestActionIdx += 1
      this.actionHistory[this.latestActionIdx]?.exec()
    }
  }
}
