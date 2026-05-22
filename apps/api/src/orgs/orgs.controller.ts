import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrgsService } from './orgs.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { CurrentUser } from '../auth/decorators/auth.decorators';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('orgs')
export class OrgsController {
  constructor(private orgsService: OrgsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created' })
  createOrg(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrgDto,
  ) {
    return this.orgsService.createOrg(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orgs I belong to' })
  getMyOrgs(@CurrentUser('id') userId: string) {
    return this.orgsService.getMyOrgs(userId);
  }

  @Get(':orgId/members')
  @ApiOperation({ summary: 'Get all members of an org' })
  getMembers(
    @Param('orgId') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgsService.getMembers(orgId, userId);
  }

  @Post(':orgId/invite')
  @ApiOperation({ summary: 'Invite a member to org (OWNER or ADMIN only)' })
  inviteMember(
    @Param('orgId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.orgsService.inviteMember(orgId, userId, dto);
  }

  @Delete(':orgId/members/:targetUserId')
  @ApiOperation({ summary: 'Remove a member from org (OWNER only)' })
  removeMember(
    @Param('orgId') orgId: string,
    @Param('targetUserId') targetUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgsService.removeMember(orgId, userId, targetUserId);
  }
}