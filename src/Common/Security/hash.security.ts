import * as bcrypt from 'bcrypt';

export function hash(data: string , saltOrRounds: number = Number(process.env.SALT_ROUND)): string {

    return bcrypt.hashSync(data, saltOrRounds);
  };
  
export function compare(data: string , encrypted: string): boolean {

    return bcrypt.compareSync(data, encrypted);
  };
  
