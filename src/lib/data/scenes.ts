/**
 * scenes.ts
 * All multi-speaker scenes keyed by scene ID.
 *
 * Each scene is a factory function — takes NPC images and player avatar
 * at call time so nothing is stale. Returns SceneLine[].
 *
 * In QuestService (or wherever):
 *   import { scenes } from '$lib/data/scenes';
 *   const lines = scenes['sylvie_intro_scene'](npcs, playerAvatar);
 *   dialogueStore.startScene(lines, playerTags, onComplete);
 */

import type { SceneLine } from '$lib/stores/dialogueStore';

type NpcImages = Record<string, { profileImage: string } | undefined>;

export const scenes: Record<string, (npcs: NpcImages, playerAvatar: string) => SceneLine[]> = {

    // ─── TEST SCENE ───────────────────────────────────────────────────────────
    // sylvie_intro_scene
    // Triggered by: sylvie_sword_0, stage 1 (watch_scene)
    // Tests:
    //   ✓ multi-speaker (Sylvie + You)
    //   ✓ player choice with two branches
    //   ✓ tag set on choice (sylvie_told_lost / sylvie_told_passing_through)
    //   ✓ conditional lines (requiredTag)
    //   ✓ continuation lines per choice
    //   ✓ {playerName} token in final line

    sylvie_intro_scene: (npcs, playerAvatar) => [
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "Oh — you're new here, aren't you."
        },
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "I can always tell. You have that look. Like the island hasn't decided what to do with you yet."
        },
        {
            speaker: 'You',
            speakerImage: playerAvatar,
            line: "..."
        },
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "That's fine. It'll figure it out. It always does."
        },
        {
            type: 'choice',
            speaker: 'You',
            speakerImage: playerAvatar,
            prompt: "What do you say?",
            choices: [
                {
                    text: "I'm just passing through.",
                    tag: 'sylvie_told_passing_through',
                    continues: [
                        {
                            speaker: 'Sylvie',
                            speakerImage: npcs['sylvie']?.profileImage,
                            line: "Sure you are."
                        },
                        {
                            speaker: 'Sylvie',
                            speakerImage: npcs['sylvie']?.profileImage,
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
                            speakerImage: npcs['sylvie']?.profileImage,
                            line: "Honest. I like that."
                        },
                        {
                            speaker: 'Sylvie',
                            speakerImage: npcs['sylvie']?.profileImage,
                            line: "Not knowing is fine. The island will show you. It showed me."
                        }
                    ]
                }
            ]
        },
        // Conditional — only if player said lost
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "I was lost too, when I first got here. That was a long time ago.",
            requiredTag: 'sylvie_told_lost'
        },
        // Conditional — only if player said passing through
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "Passing through. Ha.",
            requiredTag: 'sylvie_told_passing_through'
        },
        // Shared ending
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "Anyway. I'm Sylvie. I know most of what moves in these woods."
        },
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "Come find me if you need anything. I'll probably be around."
        },
        // {playerName} token test — Sylvie somehow already knows your name
        {
            speaker: 'Sylvie',
            speakerImage: npcs['sylvie']?.profileImage,
            line: "And hey — {playerName}? Don't wander too far north yet. The forest gets strange up there."
        }
    ]
};

export const waterfallGroupScene = [
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Okay. Everyone is here. This is happening."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "I organized it. Before anyone says anything — I organized it and I'm proud of that."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "She's been planning this for four days."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Three days. It was three days."
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "It's good. Thank you, Claudia."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "See! Guinevere-onii-chan appreciates it!"
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "I also appreciate it."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "You said 'it's fine' when I told you."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "'It's fine' means I appreciate it."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "That is not what 'it's fine' means."
    },
    // Veres optional lines
    {
        speaker: "Veres",
        speakerImage: "/images/characters/veres/veres_avatar.png",
        line: "I've been on a mountain for eleven years. This is the most conversation I've had in a decade.",
        requiredTag: "met_veres"
    },
    {
        speaker: "Veres",
        speakerImage: "/images/characters/veres/veres_avatar.png",
        line: "I find I don't mind.",
        requiredTag: "met_veres"
    },
    // The report begins
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "Claudia. The shrine report."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Right! Okay. So. The primary site at the Dragon Shrine — the one with Her Majesty's Watch — the readings are consistent with what we expected. High concentration, stable emergence pattern."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "The secondary site, two hundred meters east of the primary, showed emergence signatures three days ago. Lower concentration. Different Theos signature entirely."
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "And the depth on the secondary — was it consistent with the primary layer, or deeper?"
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Deeper. Significantly. Why?"
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "Just confirming something."
    },
    // The player catches this — Gwen already knew
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "You already knew that."
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "I had a hypothesis. You confirmed it."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "That is exactly what knowing it looks like.",
        requiredTagAbsent: "veres_concordat_tension_noted"
    },
    // Veres optional observation
    {
        speaker: "Veres",
        speakerImage: "/images/characters/veres/veres_avatar.png",
        line: "She does that.",
        requiredTag: "met_veres"
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "Veres.",
        requiredTag: "met_veres"
    },
    {
        speaker: "Veres",
        speakerImage: "/images/characters/veres/veres_avatar.png",
        line: "It's not a criticism. It's an observation.",
        requiredTag: "met_veres"
    },
    // The moment passes — warmth returns
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Anyway. The waterfall is very pretty and I didn't organize this so we could talk about substrate depths."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "You absolutely organized it partly to talk about substrate depths."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Partly. The other part is this."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "My family had parties. The correct kind. The kind where no one said anything real to anyone.",
        requiredTagAbsent: "claudia_family_mentioned"
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "This is better. Obviously."
    },
    {
        speaker: "Player",
        line: "Obviously.",
        isPlayer: true
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "See! {playerName} gets it!"
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "We all get it, Claudia."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Then say it more!"
    },
    // Quiet beat
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "This is good."
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "This is genuinely good."
    },
    // Departure
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "We have to go soon."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "I know. Eastern Coalition business. It's important. I'm aware."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "I'm still annoyed about the timing."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "We'll be back. Gwen knows where to find us if anything goes sideways."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "Don't let anything go sideways."
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "When have I ever."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "I have a LIST—"
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "Claudia."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "We're going. We're going."
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "{playerName}. You're in the birthday calendar. It's too late to remove you.",
        requiredTagAbsent: "claudia_birthday_mentioned"
    },
    {
        speaker: "Claudia",
        speakerImage: "/images/characters/claudia/claudia_avatar.png",
        line: "Don't disappear."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "Take care of yourself."
    },
    {
        speaker: "Cygwin",
        speakerImage: "/images/characters/cygwin/cygwin_avatar.png",
        line: "And take care of her.",
        requiredTag: "gwen_sr1_complete"
    },
    // Veres closing optional line
    {
        speaker: "Veres",
        speakerImage: "/images/characters/veres/veres_avatar.png",
        line: "I like your friends.",
        requiredTag: "met_veres"
    },
    {
        speaker: "Gwen",
        speakerImage: "/images/characters/guinevere/guinevere_avatar.png",
        line: "So do I.",
        requiredTag: "met_veres"
    }
];