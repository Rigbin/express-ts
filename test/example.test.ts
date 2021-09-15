describe('example tests to check jest', () => {
  test('truthy', () => {
    expect(true).toBeTruthy();
    expect({}).toBeTruthy();
    expect([]).toBeTruthy();
    expect(1).toBeTruthy();
    expect(-1).toBeTruthy();
  });

  test('falsy', () => {
    expect(false).toBeFalsy();
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
  });

  test('how cast to number with "+" in TypeScript works', () => {
    expect(+'abc' || 0).toBe(0); // NaN
    const t: unknown = undefined;
    expect(+t || 1).toBe(1);
    expect(+'one' || 2).toBe(2); // NaN
    expect(+{val: 42} || 3).toBe(3); // NaN
  });
});
