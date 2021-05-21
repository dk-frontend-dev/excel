export const str = 'hi'

async function foo() {
  await Promise.resolve()
}

foo()

console.log(foo(), '!')
