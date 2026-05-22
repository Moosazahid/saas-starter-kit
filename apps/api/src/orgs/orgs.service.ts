import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class OrgsService {
  constructor(private prisma: PrismaService) {}

  // ─── Create Org ────────────────────────────────────────────────────────────
  async createOrg(userId: string, dto: CreateOrgDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) throw new ConflictException('Organization name already taken');

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: { members: true },
    });

    return org;
  }

  // ─── Get My Orgs ───────────────────────────────────────────────────────────
  async getMyOrgs(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        org: true,
      },
    });
  }

  // ─── Get Org Members ───────────────────────────────────────────────────────
  async getMembers(orgId: string, userId: string) {
    await this.validateMember(orgId, userId);

    return this.prisma.organizationMember.findMany({
      where: { orgId },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  // ─── Invite Member ─────────────────────────────────────────────────────────
  async inviteMember(orgId: string, userId: string, dto: InviteMemberDto) {
    await this.validateRole(orgId, userId, ['OWNER', 'ADMIN']);

    const invitee = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!invitee) throw new NotFoundException('User with that email not found');

    const existing = await this.prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId: invitee.id } },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.organizationMember.create({
      data: {
        orgId,
        userId: invitee.id,
        role: dto.role,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  // ─── Remove Member ─────────────────────────────────────────────────────────
  async removeMember(orgId: string, requesterId: string, targetUserId: string) {
    await this.validateRole(orgId, requesterId, ['OWNER']);

    const member = await this.prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId: targetUserId } },
    });
    if (!member) throw new NotFoundException('Member not found');

    await this.prisma.organizationMember.delete({
      where: { orgId_userId: { orgId, userId: targetUserId } },
    });

    return { message: 'Member removed successfully' };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  private async validateMember(orgId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId } },
    });
    if (!member) throw new ForbiddenException('You are not a member of this org');
    return member;
  }

  private async validateRole(
    orgId: string,
    userId: string,
    allowedRoles: string[],
  ) {
    const member = await this.validateMember(orgId, userId);
    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenException('You do not have permission for this action');
    }
    return member;
  }
}