module.exports = {
    name: 'memories',
    description: 'Memories... Ahhhh... Feels like it was just yesterday...',
    execute(message, args) {
        message.channel.send({
            files: ['https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b05d80a0-2a64-476e-8971-3fbb10b3173f/ddwafa3-06efe8b8-b42e-453f-b652-5221a9a2bb9e.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvYjA1ZDgwYTAtMmE2NC00NzZlLTg5NzEtM2ZiYjEwYjMxNzNmXC9kZHdhZmEzLTA2ZWZlOGI4LWI0MmUtNDUzZi1iNjUyLTUyMjFhOWEyYmI5ZS5qcGcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.mxVGSkUS7GpbIUu-1n7ZUHFjNvM0yXRZehNBOVNUFw8']
        });
    }
}
