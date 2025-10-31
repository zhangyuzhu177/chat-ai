import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  account: string

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  avatar: string

  @Column({ default: false })
  status: boolean
}
