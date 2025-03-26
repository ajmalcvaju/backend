import { TeamRepository } from "../../../domain/repositories/UserRepository";
import { Team } from "../../../domain/entities/Team";

export class TeamUseCase {
  private teamRepository: TeamRepository;

  constructor(teamRepository: TeamRepository) {
    this.teamRepository = teamRepository;
  }

  async createTeam(teamName: string, maxMembers: number, privacy: "public" | "private", userId: string): Promise<Team> {
    return this.teamRepository.createTeam(teamName, maxMembers, privacy, userId);
  }

  async getTeams(): Promise<Team[]> {
    return this.teamRepository.getTeams();
  }

  async joinTeam(teamId: string, userId: string): Promise<Team[]> {
    return this.teamRepository.joinTeam(teamId, userId);
  }

  async getTeam(id: string): Promise<Team | null> {
    return this.teamRepository.getTeam(id);
  }

  async leftRemoveTeam(teamId: string, userId: string): Promise<Team | null> {
    return this.teamRepository.leftRemoveTeam(teamId, userId);
  }

  async getSlotsForSell(id: string): Promise<any[]> {
    return this.teamRepository.getSlotsForSell(id);
  }

  async sellSlot(teamId: string, userId: string, vacancy: number, slotId: string): Promise<Team | null> {
    return this.teamRepository.sellSlot(teamId, userId, vacancy, slotId);
  }

  async joinSlot(teamId: string, slotId: string, userId: string): Promise<Team | null> {
    return this.teamRepository.joinSlot(teamId, slotId, userId);
  }

  async getIdByMail(email: string): Promise<string | null> {
    return this.teamRepository.getIdByMail(email);
  }
}
