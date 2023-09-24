describe('hybrid_test', () => {
	before(() => {
	});

	it('Should successfully go to url and call the API', () => {
		cy.visit('https://www.duckduckgo.com/');
		cy.request({
			log: true,
			method: 'GET',
			url: `https://reqres.in/api/users?page=2`,
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then((response) => {
				Cypress.env('API_LOGS').push({
					"title": "GET request",
					"request": JSON.stringify({}),
					"response": JSON.stringify(response)
				});
				expect(response.status).to.equal(200);
				expect(response.body.page).to.equal(2);
			});
	});

	it('Should successfully got to url and call the POST API', () => {
		cy.visit('https://www.duckduckgo.com/');
		const reqBody = {'name': 'Das', 'Job': 'QA'};
		cy.request({
			log: true,
			method: 'PUT',
			body: reqBody,
			url: `https://reqres.in/api/users/2`,
			headers: {
				'Content-Type': 'application/json'
			},
		})
			.then((response) => {
				Cypress.env('API_LOGS').push({
					"title": "POST request",
					"request": JSON.stringify(reqBody),
					"response": JSON.stringify(response)
				});
				expect(response.status).to.equal(200);
				expect(response.body.page).to.equal(2);
			});
	});

});
