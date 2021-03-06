import { UntitledClient, BaseCommand, BaseCommandGroup, BaseCommandDecorators, BaseMessage } from '../../../';
import { oneLine } from 'common-tags';
import { Message } from 'discord.js';

const { name, group, memberName, description, throttling } = BaseCommandDecorators;

@name('ping')
@group('util')
@memberName('ping')
@description('Checks the bot\'s ping to the Discord server.')
@throttling({ usages: 5, duration: 10 })
export class PingCommand extends BaseCommand {
	public async run(msg: BaseMessage): Promise<Message | Message[]> {
		if (!msg.editable) {
			const pingMsg = await msg.reply('Pinging...');
			return (pingMsg as Message).edit(oneLine`
				${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
				🏓 Pong! The message round-trip took ${(pingMsg as Message).createdTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		} else {
			await msg.edit('Pinging...');
			return msg.edit(oneLine`
				🏓 Pong! The message round-trip took ${msg.editedTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		}
	}
}
