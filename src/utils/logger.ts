import chalk from "chalk";

export const logger = {
  info: (...args: any[]) => console.log(chalk.blue("[ℹ]"), ...args),
  success: (...args: any[]) => console.log(chalk.green("[✓]"), ...args),
  warn: (...args: any[]) => console.warn(chalk.yellow("[⚠]"), ...args),
  error: (...args: any[]) => console.error(chalk.red("[✗]"), ...args),
  debug: (...args: any[]) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray("[DEBUG]"), ...args);
    }
  },
};
