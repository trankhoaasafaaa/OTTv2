'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateUsername,
  validatePassword,
  validateEmail,
  requireTournamentStaff
} = require('../server/auth/service');

test('username and email validation', () => {
  assert.equal(
    validateUsername(' Student_01 '),
    'student_01'
  );

  assert.throws(
    () => validateUsername('student/name'),
    { status: 400 }
  );

  assert.equal(
    validateEmail('AN@School.edu'),
    'an@school.edu'
  );

  assert.equal(
    validateEmail(''),
    null
  );

  assert.throws(
    () => validateEmail('invalid-email'),
    { status: 400 }
  );
});

test('password policy checks length, letter, number and bytes', () => {
  assert.equal(
    validatePassword('StrongPassword123!'),
    'StrongPassword123!'
  );

  for (const password of [
    'short1',
    'onlylettersabcdef',
    '1234567890123456',
    'a1' + 'á'.repeat(36)
  ]) {
    assert.throws(
      () => validatePassword(password),
      { status: 400 }
    );
  }
});

test('Judge can manage only assigned tournaments', async () => {
  const prisma = {
    tournamentStaff: {
      async findUnique({ where }) {
        const assignment =
          where.tournamentId_userId;

        return (
          assignment.tournamentId === 'assigned' &&
          assignment.userId === 'judge-id'
        )
          ? { id: 'assignment-id' }
          : null;
      }
    }
  };

  const judge = {
    id: 'judge-id',
    role: 'JUDGE',
    isActive: true
  };

  await requireTournamentStaff(
    prisma,
    judge,
    'assigned'
  );

  await assert.rejects(
    requireTournamentStaff(
      prisma,
      judge,
      'another-tournament'
    ),
    { status: 403 }
  );
});

test('Student is rejected; active Admin is accepted', async () => {
  const prisma = {
    tournamentStaff: {
      findUnique: async () => null
    }
  };

  await assert.rejects(
    requireTournamentStaff(
      prisma,
      {
        id: 'student-id',
        role: 'STUDENT',
        isActive: true
      },
      'tournament-id'
    ),
    { status: 403 }
  );

  await requireTournamentStaff(
    prisma,
    {
      id: 'admin-id',
      role: 'ADMIN',
      isActive: true
    },
    'tournament-id'
  );

  await assert.rejects(
    requireTournamentStaff(
      prisma,
      {
        id: 'inactive-admin',
        role: 'ADMIN',
        isActive: false
      },
      'tournament-id'
    ),
    { status: 401 }
  );
});