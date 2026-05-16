/**
 * SauceDemo test user credentials.
 * Each user type exercises a different application behavior.
 */
export const USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  locked: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
  performance_glitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
  },
  error: {
    username: 'error_user',
    password: 'secret_sauce',
  },
  visual: {
    username: 'visual_user',
    password: 'secret_sauce',
  },
} as const;

export const CUSTOMER_INFO = {
  valid: {
    firstName: 'Jane',
    lastName: 'Doe',
    postalCode: '10001',
  },
  missingFirstName: {
    firstName: '',
    lastName: 'Doe',
    postalCode: '10001',
  },
  missingLastName: {
    firstName: 'Jane',
    lastName: '',
    postalCode: '10001',
  },
  missingPostalCode: {
    firstName: 'Jane',
    lastName: 'Doe',
    postalCode: '',
  },
} as const;
