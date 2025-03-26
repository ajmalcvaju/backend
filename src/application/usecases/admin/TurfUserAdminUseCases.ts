import { TurfUserAdminRepository } from "../../../domain/repositories/AdminRepository";

export class TurfUserAdmin {
  constructor(private readonly adminRepo: TurfUserAdminRepository) {}

  async getUsers() {
    return await this.adminRepo.findUsers();
  }

  async getTurfs() {
    return await this.adminRepo.findTurfs();
  }

  async toggleUserBlock(id: string, block: boolean) {
    return await this.adminRepo.blockUser(id, block);
  }

  async toggleTurfBlock(id: string, block: boolean) {
    return await this.adminRepo.blockTurf(id, block);
  }
}
