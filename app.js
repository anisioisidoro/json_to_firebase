const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./challengeKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const schema = require('./schema.js').schema;

const json2firestore = (_JSON, db, schema) => {
	console.log(_JSON);
	return Promise.all(
		Object.keys(schema).map((collection) => {
			let promises = [];
			let doc_dataa = Object.assign({}, _JSON);
			Object.keys(doc_dataa).map((_doc) => {
				const doc_id = _doc;

				if (_doc === '__type__') return;
				let doc_data = Object.assign({}, _JSON[_doc]);
				console.log(doc_data);
				Object.keys(doc_data).map((_doc_data) => {
					if (doc_data[_doc_data] && doc_data[_doc_data].__type__)
						delete doc_data[_doc_data];
				});

				promises.push(
					db
						.collection(collection)
						.doc()
						.set({
							title: doc_data['title'],
							type: doc_data['type'],
							description: doc_data['description'],
							filename: doc_data['filename'],
							height: parseFloat(doc_data['height']),
							width: parseFloat(doc_data['width']),
							price: parseFloat(doc_data['price']),
							rating: parseInt(doc_data['rating']),
							created: admin.firestore.Timestamp.now(),
						})
						.then(() => {
							return json2firestore(
								_JSON,
								db.collection(collection).doc(),
								schema[collection]
							);
						})
				);
			});
			return Promise.all(promises);
		})
	);
};
fs.readFile('./products.json', (error, data) => {
	json2firestore(JSON.parse(data), admin.firestore(), { ...schema }).then(() =>
		console.log('done')
	);
});
