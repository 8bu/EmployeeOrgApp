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
    if (eId === sId)
      throw new Error('Employee cannot supervise themselves, mate!')

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
    const {
      employee: {
        subordinates: cachedEmployeeSubordinates,
      },
    } = this.findIdOrThrow(eId)

    /**
     * Move employee to new supervisor
     * @param _eId Employee ID
     * @param _sId Supervisor ID
     * @param wholeBranch Whether to move whole branch or just employee
     */
    const _move = (_eId: number, _sId: number, wholeBranch = false): void => {
      const _employeePosition = this.findIdOrThrow(_eId)
      const _supervisorPosition = this.findIdOrThrow(_sId)

      // We don't need to do anything if the employee is already in the same supervisor
      if (_employeePosition.supervisor.uniqueId !== _sId) {
        const { employee, supervisor: currentSupervisor } = _employeePosition
        const nextSupervisor = _supervisorPosition.employee
        // Remove employee from current supervisor
        // Subordinates of that employee will be moved to the new supervisor as well
        currentSupervisor.subordinates = currentSupervisor.subordinates.filter(
          e => !(e.uniqueId === _eId),
        ).concat(wholeBranch ? [] : employee.subordinates)
        if (!wholeBranch) employee.subordinates = []
        nextSupervisor.subordinates.push(employee)
      }
    }

    const exec = () => {
      _move(eId, sId)
    }

    // Undo will roll back exec action
    // In this case, we restore the previous supervisor
    const undo = () => {
      _move(eId, cachedSupervisor.uniqueId)
      // Giving back subordinates to the employee
      cachedEmployeeSubordinates.forEach((sub) => {
        _move(sub.uniqueId, eId, true)
      })
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
