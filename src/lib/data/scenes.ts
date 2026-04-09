/**
 * scenes.ts
 * All multi-speaker scenes keyed by scene ID.
 *
 * Each scene is a factory function — takes NPC data and player avatar
 * at call time so nothing is stale. Returns SceneLine[].
 *
 * NpcData carries profileImage and types so DialogueBox can colour
 * the speaker nameplate per element without hardcoding anything here.
 *
 * Characters without NPC data (e.g. minor characters, narration) simply
 * omit speakerImage and speakerElements — DialogueBox handles both gracefully.
 */

import type { SceneLine } from '$lib/stores/dialogueStore';

// Extended to carry what DialogueBox needs for element-based styling
type NpcData = {
    profileImage?: string;
    types?: string[];
} | undefined;

type NpcImages = Record<string, NpcData>;

// Helper — builds the common speaker fields from NPC data
function npc(npcs: NpcImages, id: string): { speakerImage: string | null; speakerElements: string[] } {
    const data = npcs[id];
    return {
        speakerImage:    data?.profileImage ?? null,
        speakerElements: data?.types ?? [],
    };
}

export const scenes: Record<string, (npcs: NpcImages, playerAvatar: string) => SceneLine[]> = {

    // ─── Sylvie intro scene ───────────────────────────────────────────────────
    // Triggered by: sylvie_sword_0, stage 1 (watch_scene)

    sylvie_intro_scene: (npcs, playerAvatar) => [
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "Oh — you're new here, aren't you."
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "I can always tell. You have that look. Like the island hasn't decided what to do with you yet."
        },
        {
            speaker: 'You',
            speakerImage: playerAvatar,
            speakerElements: [],
            line: "..."
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "That's fine. It'll figure it out. It always does."
        },
        {
            type: 'choice',
            speaker: 'You',
            speakerImage: playerAvatar,
            speakerElements: [],
            prompt: "What do you say?",
            choices: [
                {
                    text: "I'm just passing through.",
                    tag: 'sylvie_told_passing_through',
                    continues: [
                        {
                            speaker: 'Sylvie',
                            ...npc(npcs, 'sylvie'),
                            line: "Sure you are."
                        },
                        {
                            speaker: 'Sylvie',
                            ...npc(npcs, 'sylvie'),
                            line: "Nobody passes through Dragon Island. You arrive, and then you stay."
                        }
                    ]
                },
                {
                    text: "I don't know what I'm doing here.",
                    tag: 'sylvie_told_lost',
                    continues: [
                        {
                            speaker: 'Sylvie',
                            ...npc(npcs, 'sylvie'),
                            line: "Honest. I like that."
                        },
                        {
                            speaker: 'Sylvie',
                            ...npc(npcs, 'sylvie'),
                            line: "Not knowing is fine. The island will show you. It showed me."
                        }
                    ]
                }
            ]
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "I was lost too, when I first got here. That was a long time ago.",
            requiredTag: 'sylvie_told_lost'
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "Passing through. Ha.",
            requiredTag: 'sylvie_told_passing_through'
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "Anyway. I'm Sylvie. I know most of what moves in these woods."
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "Come find me if you need anything. I'll probably be around."
        },
        {
            speaker: 'Sylvie',
            ...npc(npcs, 'sylvie'),
            line: "And hey — {playerName}? Don't wander too far north yet. The forest gets strange up there."
        }
    ],

    // ─── Waterfall group scene ────────────────────────────────────────────────
    // Triggered by: guinevere_sword_3, stage 1 (watch_scene)
    // Requires: claudia_sword_3_complete, cygwin_sword_3_complete
    // Veres lines conditional on: met_veres

    waterfall_group_scene: (npcs, playerAvatar) => [
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Okay. Everyone is here. This is happening."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "I organized it. Before anyone says anything — I organized it and I'm proud of that."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "She's been planning this for four days."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Three days. It was three days."
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "It's good. Thank you, Claudia."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "See! Guinevere-onii-chan appreciates it!"
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "I also appreciate it."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "You said 'it's fine' when I told you."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "'It's fine' means I appreciate it."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "That is not what 'it's fine' means."
        },
        // Veres optional
        {
            speaker: 'Veres',
            ...npc(npcs, 'veres'),
            line: "I've been on a mountain for eleven years. This is the most conversation I've had in a decade.",
            requiredTag: 'met_veres'
        },
        {
            speaker: 'Veres',
            ...npc(npcs, 'veres'),
            line: "I find I don't mind.",
            requiredTag: 'met_veres'
        },
        // The report
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "Claudia. The shrine report."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Right! Okay. So. The primary site at the Dragon Shrine — the one with Her Majesty's Watch — the readings are consistent with what we expected. High concentration, stable emergence pattern."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "The secondary site, two hundred meters east of the primary, showed emergence signatures three days ago. Lower concentration. Different Theos signature entirely."
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "And the depth on the secondary — was it consistent with the primary layer, or deeper?"
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Deeper. Significantly. Why?"
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "Just confirming something."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "You already knew that."
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "I had a hypothesis. You confirmed it."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "That is exactly what knowing it looks like."
        },
        // Veres optional observation
        {
            speaker: 'Veres',
            ...npc(npcs, 'veres'),
            line: "She does that.",
            requiredTag: 'met_veres'
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "Veres.",
            requiredTag: 'met_veres'
        },
        {
            speaker: 'Veres',
            ...npc(npcs, 'veres'),
            line: "It's not a criticism. It's an observation.",
            requiredTag: 'met_veres'
        },
        // Warmth returns
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Anyway. The waterfall is very pretty and I didn't organize this so we could talk about substrate depths."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "You absolutely organized it partly to talk about substrate depths."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Partly. The other part is this."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "My family had parties. The correct kind. The kind where no one said anything real to anyone.",
            requiredTagAbsent: 'claudia_family_mentioned'
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "This is better. Obviously."
        },
        {
            speaker: 'You',
            speakerImage: playerAvatar,
            speakerElements: [],
            line: "Obviously."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "See! {playerName} gets it!"
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "We all get it, Claudia."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Then say it more!"
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "This is good."
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "This is genuinely good."
        },
        // Departure
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "We have to go soon."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "I know. Eastern Coalition business. It's important. I'm aware."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "I'm still annoyed about the timing."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "We'll be back. Gwen knows where to find us if anything goes sideways."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "Don't let anything go sideways."
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "When have I ever."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "I have a LIST—"
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "Claudia."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "We're going. We're going."
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "{playerName}. You're in the birthday calendar. It's too late to remove you.",
            requiredTagAbsent: 'claudia_birthday_mentioned'
        },
        {
            speaker: 'Claudia',
            ...npc(npcs, 'claudia'),
            line: "Don't disappear."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "Take care of yourself."
        },
        {
            speaker: 'Cygwin',
            ...npc(npcs, 'cygwin'),
            line: "And take care of her.",
            requiredTag: 'gwen_sr1_complete'
        },
        // Veres closing
        {
            speaker: 'Veres',
            ...npc(npcs, 'veres'),
            line: "I like your friends.",
            requiredTag: 'met_veres'
        },
        {
            speaker: 'Gwen',
            ...npc(npcs, 'guinevere'),
            line: "So do I.",
            requiredTag: 'met_veres'
        }
    ]
};