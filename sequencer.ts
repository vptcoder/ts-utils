console.log('start');

function* SequenceExecutor(callback: (i: any) => {}, queue: string[]) {
	for (const q of queue) {
		yield callback(q);
	}
}

function sendEmail(a: string) {
	console.log('Sent email to: ', a);
	return { status: 'OK' };
}

const emailList = ['aaa@gmail.com', 'bbb@gmail.com', 'ccc@gmail.com'];
const executor = SequenceExecutor(sendEmail, emailList);

let done = false;
while (!done) {
	const result = executor.next();
	done = result.done ?? true;
}

console.log('end');
