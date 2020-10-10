// sample test file for continuous integration
test('sample test', () => {
    expect(1 + 2).toBe(3);
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect({key: 'value'}).toEqual({key: 'value'});
})