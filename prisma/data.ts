import { randUser } from '@ngneat/falso';

const users: { email: string; name: string; username: string }[] = [];

for (let i = 0; i < 200; i++) {
  const user = randUser();
  users.push({
    email: user.email,
    username: user.username,
    name: `${user.firstName} ${user.lastName}`,
  });
}

export default users;
