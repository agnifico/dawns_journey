import { playerStore } from '$lib/stores/playerStore';
import { messageStore } from '$lib/stores/messageStore';
import { v4 as uuidv4 } from 'uuid';
import { addItem, removeItem } from './ItemService';

const LEAVES_PER_COMPOST = 5;
const DURATION_PER_COMPOST_MS = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Starts one or more composting tasks.
 * @param leavesToUse The total number of leaves to commit to composting.
 */
export function startComposting(leavesToUse: number) {
    if (leavesToUse <= 0 || leavesToUse % LEAVES_PER_COMPOST !== 0) {
        messageStore.addMessage('You must use a multiple of 5 leaves.', ['System']);
        return;
    }

    playerStore.update(player => {
        let newPlayer = { ...player };
        const leavesInInventory = newPlayer.inventory.find(i => i.itemId === 'leaves');

        if (!leavesInInventory || leavesInInventory.amount < leavesToUse) {
            messageStore.addMessage('You do not have enough leaves.', ['System']);
            return player;
        }

        const compostToProduce = leavesToUse / LEAVES_PER_COMPOST;
        const totalDuration = compostToProduce * DURATION_PER_COMPOST_MS;

        // Consume leaves
        newPlayer = removeItem(newPlayer, 'leaves', leavesToUse);

        const newCompostTask = {
            id: uuidv4(),
            compostToProduce: compostToProduce,
            startTime: Date.now(),
            duration: totalDuration,
        };

        newPlayer.homestead.compostQueue.push(newCompostTask);

        return newPlayer;
    });
}

/**
 * Claims the finished compost from a completed task.
 * @param taskId The ID of the compost task to claim.
 */
export function claimCompost(taskId: string) {
    playerStore.update(player => {
        let newPlayer = { ...player };
        const taskIndex = newPlayer.homestead.compostQueue.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            messageStore.addMessage('Compost task not found.', ['System']);
            return player;
        }

        const task = newPlayer.homestead.compostQueue[taskIndex];
        const timeElapsed = Date.now() - task.startTime;

        if (timeElapsed < task.duration) {
            messageStore.addMessage('This compost is not ready yet.', ['System']);
            return player;
        }

        // Add compost to inventory
        newPlayer = addItem(newPlayer, 'compost', task.compostToProduce);

        // Remove task from queue
        newPlayer.homestead.compostQueue.splice(taskIndex, 1);

        return newPlayer;
    });
}
