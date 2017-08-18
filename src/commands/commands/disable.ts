import { UntitledClient, BaseArgument, BaseCommand, BaseCommandGroup, BaseMessage, disambiguation } from '../../';
import { oneLine, stripIndents } from 'common-tags';
import { Collection, Message } from 'discord.js';

export class DisableCommandCommand<T extends UntitledClient = UntitledClient> extends BaseCommand {
	public readonly client: T;
	public constructor(client: T) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			group: 'commands',
			memberName: 'disable',
			description: 'Disables a command or command group.',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['disable util', 'disable Utility', 'disable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to disable?',
					validate: (val: string) => {
						if (!val) return false;
						const groups: Collection<string, BaseCommandGroup> | BaseCommandGroup[] = this.client.registry.findGroups(val);
						if ((groups as BaseCommandGroup[]).length === 1) return true;
						const commands: Collection<string, BaseCommand> | BaseCommand[] = this.client.registry.findCommands(val);
						if ((commands as BaseCommand[]).length === 1) return true;
						if ((commands as BaseCommand[]).length === 0 && (groups as BaseCommandGroup[]).length === 0) return false;
						return stripIndents`
							${(commands as BaseCommand[]).length > 1 ? disambiguation((commands as BaseCommand[]), 'commands') : ''}
							${(groups as BaseCommandGroup[]).length > 1 ? disambiguation((groups as BaseCommandGroup[]), 'groups') : ''}
						`;
					},
					parse: (val: string) => (this.client.registry.findGroups(val) as BaseCommandGroup[])[0] || (this.client.registry.findCommands(val) as BaseCommand[])[0]
				}
			]
		});
	}

	public hasPermission(msg: BaseMessage): boolean {
		if (!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	public run(msg: BaseMessage, { cmdOrGrp }: { cmdOrGrp: BaseCommandGroup | BaseCommand }): Promise<Message | Message[]> {
		if (!cmdOrGrp.isEnabledIn(msg.guild)) {
			return msg.reply(
				`The \`${cmdOrGrp.name}\` ${(cmdOrGrp as BaseCommand).group ? 'command' : 'group'} is already disabled.`
			);
		}
		if (cmdOrGrp.guarded) {
			return msg.reply(
				`You cannot disable the \`${cmdOrGrp.name}\` ${(cmdOrGrp as BaseCommand).group ? 'command' : 'group'}.`
			);
		}
		cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.reply(`Disabled the \`${cmdOrGrp.name}\` ${(cmdOrGrp as BaseCommand).group ? 'command' : 'group'}.`);
	}
}