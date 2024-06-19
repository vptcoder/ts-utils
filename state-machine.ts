console.log('start');

const transition: Record<string, unknown> = {
	default: {
		save: 'draft',
		submit: 'submitted',
	},
	new: {
		save: 'draft',
		submit: 'submitted',
	},
	draft: {
		save: 'draft',
		submit: 'pendingApproval',
	},
	pendingApproval: {
		review: 'reviewed',
		reject: 'rejected',
		approve: 'approved',
		cancel: 'cancelled',
	},
	rejected: {
		resubmit: 'pendingApproval',
	},
	approved: {
		review: 'reviewed',
	},
	reviewed: {
		provision: 'inProgress',
	},
	inProgress: {
		provisionFailed: 'failed',
		provisionSuccessfully: 'completed',
	},
	completed: {
		close: 'closed',
		open: 'inQueue',
	},
	inQueue: {
		close: 'closed',
	},
};

function overrideTransition(current: string, action: string, next: string) {
	if (transition[current] === undefined) {
		transition[current] = {};
	}
	(transition[current] as Record<string, unknown>)[action] = next;
}

function next(current: string, action: string) {
	return (transition[current] as Record<string, unknown>)?.[action];
}

console.log('next state: ', next('inQueue', 'close'));
overrideTransition('inQueue', 'close', 'expired');
console.log('next state: ', next('inQueue', 'close'));

console.log('next state: ', next('test', 'action'));
overrideTransition('test', 'action', 'result');
console.log('next state: ', next('test', 'action'));
console.log('end');

