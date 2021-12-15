// import { KillIntervals } from "../../custom/storage";
// import { ArgumentValues, Command } from "../../custom/base";
// import { Message } from "discord.js";
// import { Collection, GuildMember } from "discord.js";
// import { format as f, logger as log } from "../../custom/logger";

// const killCommand: Command = {
//     name: "kill",
//     description: "Kicks a member from voice chat every set amount of time until revived.",
//     enabled: true,
//     arguments: [
//         {
//             key: "member",
//             description: "Who is going to be killed?",
//             type: "user",
//         },
//         {
//             key: "interval",
//             description: "How often are you going to kill?",
//             type: "number",
//             validator: (interval: number) => interval >= 5,
//             default: 5,
//         },
//     ],
//     async run(message: Message, args: ArgumentValues): Promise<null> {
//         // Check permissions
//         log.debug(f("kill", "Checking permissions..."));
//         const target = args.member as GuildMember;
//         const authorRole = message.member!.roles.highest;
//         const subjectRole = target.roles.highest;
//         if (authorRole.comparePositionTo(subjectRole) < 0) {
//             log.debug(f("kill", "Permissions of target are higher than author's."));
//             message.reply("You do not have permissions to kill this member.");
//             return null;
//         }
//         log.debug(f("kill", "Permissions passed."));

//         // Check if interval is already initialized
//         log.debug(f("kill", "Check if interval is already initialized"));
//         const intervals = KillIntervals.getInstance();
//         if (intervals.has(target.id)) {
//             log.debug(f("kill", "Clearing existing interval for reset."));
//             const interval = intervals.get(target.id);
//             message.client.clearInterval(interval!);
//             intervals.delete(target.id);
//         }

//         // Init kill interval
//         log.debug(f("kill", `Member ID: ${target.id}`));
//         const interval = message.client.setInterval(
//             async (
//                 member: GuildMember,
//                 msg: Message,
//                 intrvls: Collection<string, NodeJS.Timer>
//             ) => {
//                 try {
//                     if (member.voice.channel) {
//                         log.debug(f("kill", "Kicking member..."));
//                         await member.voice.setChannel(null);
//                         log.debug(f("kill", "Member kicked."));
//                     }
//                 } catch (error) {
//                     msg.channel.send(`Can't kill ${member}, removing from kill list`);
//                     const intervalToClear = intrvls.get(member.id);
//                     msg.client.clearInterval(intervalToClear!);
//                     intrvls.delete(member.id);
//                     log.debug(f("kill error", `Interval cleared: ${member.id}`));
//                 }
//             },
//             (args.interval as number) * 1000,
//             target,
//             message,
//             intervals
//         );
//         // Store the interval for use in revival
//         intervals.set(target.id, interval);
//         log.debug(f("kill", "Interval set."));
//         return null;
//     },
// };

// export default killCommand;
