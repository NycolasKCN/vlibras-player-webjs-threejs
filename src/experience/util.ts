export function* alphabetGenerator(startChar = 'a', endChar = 'z'): Generator<string, void, unknown> {
  const start = startChar.charCodeAt(0);
  const end = endChar.charCodeAt(0);
  
  for (let i = start; i <= end; i++) {
    yield String.fromCharCode(i);
  }
}

