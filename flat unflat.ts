const data = [
	{
		key: 'input.formId',
		value: '999',
	},
	{
		key: 'input.table.{0}.label',
		value: 'label 0',
	},
	{
		key: 'input.table.{0}.text',
		value: 'text 0',
	},
	{
		key: 'input.table.{3}.label',
		value: 'label 3',
	},
	{
		key: 'input.table.{3}.text',
		value: 'text 3',
	},
	{
		key: 'input.table.{2}.label',
		value: 'label 2',
	},
	{
		key: 'input.table.{2}.text',
		value: 'text 2',
	},
	{
		key: 'input.stack.{0}.files.{0}.byte',
		value: 11,
	},
	{
		key: 'input.stack.{0}.files.{0}.drive',
		value: 'A',
	},
	{
		key: 'input.stack.{0}.files.{1}.byte',
		value: 22,
	},
	{
		key: 'input.stack.{0}.files.{1}.drive',
		value: 'B',
	},
	{
		key: 'input.stack.{1}.files.{0}.byte',
		value: 33,
	},
	{
		key: 'input.stack.{1}.files.{0}.drive',
		value: 'C',
	},
	{
		key: 'input.stack.{1}.files.{1}.byte',
		value: 44,
	},
	{
		key: 'input.stack.{1}.files.{1}.drive',
		value: 'D',
	},
];

/** Class below */

interface KeyValuePair {
	key: string;
	value: unknown;
}

export class ObjectTransformUtil {
	/** Construct a deep object from an array of key-value pair objects.
	 * @param {KeyValuePair[]} kvp Array of key-value pair objects.
	 * @param {string} delimiter default: '.'
	 * @param {string} arrayIndexWrapper Array signifier. Default: '{}'. Example: '{index}', ex: '{1}'
	 * @param {string} arrayIndexKey Persist index number info in this key. Default: 'index'
	 */
	constructObject(
		kvp: KeyValuePair[],
		delimiter: string = '.',
		arrayIndexWrapper: string = '{}',
		arrayIndexKey: string = 'index'
	) {
		if (arrayIndexWrapper.length && arrayIndexWrapper.length !== 2) {
			throw new Error('wrapper must only have 2 characters: prefix and postfix.');
		}

		const combined = {};
		kvp.forEach(({ key, value }) => {
			if (!key.includes(delimiter)) {
				return;
			}
			const fragment = key
				.split(delimiter)
				.reverse()
				.reduce<object>((acc, prop) => {
					if (
						arrayIndexWrapper.length &&
						prop.startsWith(arrayIndexWrapper[0]) &&
						prop.endsWith(arrayIndexWrapper[1])
					) {
						return [
							{
								[arrayIndexKey]: prop
									.replace(arrayIndexWrapper[0], '')
									.replace(arrayIndexWrapper[1], ''),
								...acc,
							},
						];
					}
					return { [prop]: acc };
				}, value as object);
			this.mergeObjectDeeply(combined, fragment);
		});
		return combined;
	}

	flattenToObjects(obj: object, out: object[], prefix: string | undefined) {
		Object.keys(obj).forEach((key) => {
			const combinedKey = prefix === undefined ? key : `${prefix}.${key}`;

			if (this.isObject((obj as Record<string, unknown>)[key])) {
				out = this.flattenToObjects(
					(obj as Record<string, unknown>)[key] as object,
					out,
					combinedKey
				);
			} else if (this.isArray((obj as Record<string, unknown>)[key])) {
				((obj as Record<string, unknown>)[key] as []).forEach((prop, i) => {
					this.flattenToObjects(prop, out, `${combinedKey}.{${i}}`);
				});
			} else {
				if (key === 'index') return;
				const o = {
					key: combinedKey,
					value: (obj as Record<string, unknown>)[key],
				};

				out.push(o);
			}
		});
		return out;
	}

	/** Flatten an object to list of records as properties in a shallow object.  */
	flattenToRecords(obj: object, out: object, prefix: string | undefined) {
		Object.keys(obj).forEach((key) => {
			const combinedKey = prefix === undefined ? key : `${prefix}.${key}`;

			if (this.isObject((obj as Record<string, unknown>)[key])) {
				out = this.flattenToRecords(
					(obj as Record<string, unknown>)[key] as object,
					out,
					combinedKey
				);
			} else if (this.isArray((obj as Record<string, unknown>)[key])) {
				((obj as Record<string, unknown>)[key] as []).forEach((prop, i) => {
					this.flattenToRecords(prop, out, `${combinedKey}.{${i}}`);
				});
			} else {
				if (key === 'index') return;
				(out as Record<string, unknown>)[combinedKey] = (obj as Record<string, unknown>)[
					key
				];
			}
		});
		return out;
	}

	private mergeObjectDeeply(target: object, source: object) {
		Object.keys(source).forEach((key) => {
			if (this.isObject((source as Record<string, unknown>)[key])) {
				if (!(target as Record<string, unknown>)[key]) {
					(target as Record<string, unknown>)[key] = {};
				}
				this.mergeObjectDeeply(
					(target as Record<string, unknown>)[key] as object,
					(source as Record<string, unknown>)[key] as object
				);
			} else if (this.isArray((source as Record<string, unknown>)[key])) {
				if ((target as Record<string, unknown>)[key] === undefined) {
					(target as Record<string, unknown>)[key] = [];
				}
				const combined: any[] = (target as Record<string, unknown>)[key] as [];

				((source as Record<string, unknown>)[key] as []).forEach((item: any) => {
					const exist = combined.filter((v, i) => {
						if (v === null || v === undefined) return false;
						return v.index === item.index;
					});
					if (exist.length) {
						const existIndex = combined.indexOf(exist[0]);
						this.mergeObjectDeeply(combined[existIndex] as object, item);
					} else {
						combined.push(item);
					}
				});

				(target as Record<string, unknown>)[key] = combined;
			} else {
				(target as Record<string, unknown>)[key] = (source as Record<string, unknown>)[
					key
				];
			}
		});
	}

	private isObject(item: unknown) {
		return item && typeof item === 'object' && !Array.isArray(item);
	}

	private isArray(item: unknown) {
		return item && Array.isArray(item);
	}
}

/** Test Before */

const util = new ObjectTransformUtil();

const unflatten = util.constructObject(data);
console.log('deep object:');
console.log(JSON.stringify(unflatten as object, undefined, 2));

let flattenArray: any[] = [];
flattenArray = util.flattenToObjects(unflatten, flattenArray, undefined);
console.log('flatten to objects:');
console.log(JSON.stringify(flattenArray, undefined, 2));

let flattenObject = {};
flattenObject = util.flattenToRecords(unflatten, flattenObject, undefined);
console.log('flatten to records:');
console.log(JSON.stringify(flattenObject, undefined, 2));
