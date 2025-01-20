const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const command = process.argv[2];

switch (command) {
	case 'init':
		createGitDirectory();
		break;
	case 'hash-object':
		const hash = process.argv[4];
		hashObject(hash);
		break;
	case 'cat-file':
		const hashed = process.argv[4];
		catFile(hashed);
		break;
	default:
		throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
	fs.mkdirSync(path.join(process.cwd(), '.git'), { recursive: true });
	fs.mkdirSync(path.join(process.cwd(), '.git', 'objects'), { recursive: true });
	fs.mkdirSync(path.join(process.cwd(), '.git', 'refs'), { recursive: true });

	fs.writeFileSync(path.join(process.cwd(), '.git', 'HEAD'), 'ref: refs/heads/main\n');
	console.log('Initialized git directory');
}

function hashObject(file) {
	// git hash-object -w <file>
	const content = fs.readFileSync(file);
	// format of the blob object is: blob <size>\0<content>
	const header = Buffer.from(`blob ${content.length}\0`);
	// store the header and the content in a buffer
	const store = Buffer.concat([header, content]);
	// hash the store
	const hash = crypto.createHash('sha1').update(store).digest('hex');
	// compress the store
	const compressed = zlib.deflateSync(store);
	// store the compressed store in the .git/objects directory
	const objectPath = path.join(process.cwd(), '.git', 'objects', hash.slice(0, 2));
	// create the directory if it doesn't exist
	fs.mkdirSync(objectPath, { recursive: true });
	// write the file
	fs.writeFileSync(path.join(objectPath, hash.slice(2)), compressed);
	// print the hash
	process.stdout.write(hash);
}

function catFile(hash) {
	// .git/objects/firestTwoCharacters/remainingCharacters
	// git cat-file -p 4b825dc642cb6eb9a060e54bf8d69288fbee4904
	const file = fs.readFileSync(path.join(process.cwd(), '.git', 'objects', hash.slice(0, 2), hash.slice(2)));
	const unzipped = zlib.inflateSync(file);
	// format of the blob object is: blob <size>\0<content>
	const result = unzipped.toString().split('\0')[1];
	// result is the content of the file -> <content>
	process.stdout.write(result);
}

function lsTree() {}
