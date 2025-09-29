/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodically.
*/

import config from '../../config/index.js'

class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Timer Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Timer Controller libraries.'
      )
    }

    this.debugLevel = localConfig.debugLevel

    // Constants
    this.cleanUsageInterval = 60000 * 60 // 1 hour
    this.backupUsageInterval = 60000 * 10 // 10 minutes
    this.rebootInterval = 60000 * 60 * 12 // 12 hours

    // Encapsulate dependencies
    this.config = config

    // Bind 'this' object to all subfunctions.
    this.cleanUsage = this.cleanUsage.bind(this)
    this.backupUsage = this.backupUsage.bind(this)
    this.autoReboot = this.autoReboot.bind(this)
  }

  // Start all the time-based controllers.
  startTimers () {
    // Any new timer control functions can be added here. They will be started
    // when the server starts.
    this.cleanUsageHandle = setInterval(this.cleanUsage, this.cleanUsageInterval)
    this.backupUsageHandle = setInterval(this.backupUsage, this.backupUsageInterval)

    // Periodically reboot this app. Helia has a slight memory leak, and occasionally
    // runs into unrecoverable network issues. Rebooting is one way to overcome these
    // black-box issues.
    this.rebootHandle = setInterval(this.autoReboot, this.rebootInterval)

    return true
  }

  stopTimers () {
    clearInterval(this.cleanUsageHandle)
    clearInterval(this.backupUsageHandle)
  }

  // Clean the usage state so that stats reflect the last 24 hours.
  cleanUsage () {
    try {
      clearInterval(this.cleanUsageHandle)

      const now = new Date()
      console.log(`cleanUsage() Timer Controller executing at ${now.toLocaleString()}`)

      this.useCases.usage.cleanUsage()

      this.cleanUsageHandle = setInterval(this.cleanUsage, this.cleanUsageInterval)

      return true
    } catch (err) {
      console.error('Error in time-controller.js/cleanUsage(): ', err)

      this.cleanUsageHandle = setInterval(this.cleanUsage, this.cleanUsageInterval)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }

  // Backup the usage stats to the database
  async backupUsage () {
    try {
      clearInterval(this.backupUsageHandle)

      console.log('backupUsage() Timer Controller executing at ', new Date().toLocaleString())

      // Clear the database of old usage data.
      await this.useCases.usage.clearUsage()

      // Save the current usage snapshot to the database.
      await this.useCases.usage.saveUsage()

      this.backupUsageHandle = setInterval(this.backupUsage, this.backupUsageInterval)

      return true
    } catch (err) {
      console.error('Error in time-controller.js/backupUsage(): ', err)

      this.backupUsageHandle = setInterval(this.backupUsage, this.backupUsageInterval)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }

  // This timer is used to auto-reboot the processes. If this is being run in Docker container
  // (the target for production), the Docker container should automatically restart the timer.
  // This is a temporary fix to the IPFS node stalling occasionally until a better fix can be
  // found.
  autoReboot () {
    console.log('Rebooting service.')
    process.exit(1)
  }
}

export default TimerControllers
