require('dotenv').config();
const axios = require('axios');

const { v4: uuidv4 } = require('uuid');

const { Payment, MercadoPagoConfig } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN, options: { integratorId: "dev_630851333e2711efbb7b8e3c267079e3" } })

module.exports = app => {
	const createOrder = async (req, res) => {

		if (!req.body) return res.status(400).send('Informar informações da compra!');

		if (
			!req.body.id_course ||
			!req.body.first_name ||
			!req.body.last_name ||
			!req.body.token ||
			!req.body.issuer_id ||
			!req.body.payment_method_id ||
			!req.body.installments ||
			!req.body.payer ||
			!req.body.payer.email ||
			!req.body.payer.identification ||
			!req.body.payer.identification.type ||
			!req.body.payer.identification.number ||
			!req.body.payer.phone ||
			!req.body.payer.phone.area_code ||
			!req.body.payer.phone.number
		) return res.status(400).send('Informações faltando para a compra!');

		const {
			id_course,
			first_name,
			last_name,
			token,
			issuer_id,
			payment_method_id,
			installments,
			payer
		} = req.body;

		const courses = app.utils.utils.getCoursesInJson();

		const course = courses.find(p => p.id === id_course);

		if (course) {
			const payment = new Payment(client);

			payment.create({
				body: {
					transaction_amount: Number(course.unit_price),
					token: token,
					description: course.description,
					installments: Number(installments),
					payment_method_id: payment_method_id,
					issuer_id: issuer_id,
					additional_info: {
						items: [
							{
								id: course.id,
								title: course.title,
								description: course.description,
								picture_url: course.picture_url,
								category_id: course.category_id,
								quantity: Number(course.quantity),
								unit_price: Number(course.unit_price),
							}
						],
						payer: {
							first_name: first_name,
							last_name: last_name,
							phone: {
								area_code: payer.phone.area_code,
								number: payer.phone.number
							},
						}
					},
					payer: {
						entity_type: 'individual',
						type: 'customer',
						email: payer.email,
						identification: {
							type: payer.identification.type,
							number: payer.identification.number
						},
					}
				},
				requestOptions: { idempotencyKey: uuidv4() }
			})
				.then(result => {
					// console.log(result)
					return res.status(200).json(result)
				})
				.catch(error => {
					console.log(error)
					return res.status(400).json(error)
				});
		}

	};

	const createOrderPix = async (req, res) => {
		if (!req.body) return res.status(400).send('Informar informações da compra!');

		if (
			!req.body.id_course ||
			!req.body.first_name ||
			!req.body.last_name ||
			!req.body.payer ||
			!req.body.payer.email ||
			!req.body.payer.identification ||
			!req.body.payer.identification.type ||
			!req.body.payer.identification.number ||
			!req.body.payer.phone ||
			!req.body.payer.phone.area_code ||
			!req.body.payer.phone.number
		) return res.status(400).send('Informações faltando para a compra!');

		const {
			id_course,
			first_name,
			last_name,
			payer
		} = req.body;

		const courses = app.utils.utils.getCoursesInJson();

		const course = courses.find(p => p.id === id_course);

		if (course) {
			const payment = new Payment(client);

			const expirationDate = new Date();
			expirationDate.setMinutes(expirationDate.getMinutes() + 30);

			payment.create({
				body: {
					transaction_amount: Number(course.unit_price),
					date_of_expiration: expirationDate.toISOString(),
					additional_info: {
						items: [
							{
								id: course.id,
								title: course.title,
								description: course.description,
								picture_url: course.picture_url,
								category_id: course.category_id,
								quantity: course.quantity,
								unit_price: course.unit_price,
							}
						],
						payer: {
							first_name: first_name,
							last_name: last_name,
							phone: {
								area_code: payer.phone.area_code,
								number: payer.phone.number
							},
						}
					},
					description: course.description,
					payment_method_id: "pix",
					payer: {
						email: payer.email,
						identification: {
							type: payer.identification.type,
							number: payer.identification.number
						},
					}
				},
				requestOptions: { idempotencyKey: uuidv4() }
			})
				.then(result => {
					return res.status(200).json(result)
				})
				.catch(error => {
					app.config.logger.logger.error('Error transaction method pix: %O', error.response ? error.response.data : error.message);
					return res.status(500).json(error.response ? error.response.data : error.message);
				});

		} else {
			app.config.logger.logger.error("ID do curso não encontrado: %O", id_course)
			return res.status(400).send('Curso não encontrado!');
		}

	}

	const getCourse = (req, res) => {
		if (!req.body.id_course) return res.status(400).send('Informar o id do curso!');

		const { id_course } = req.body;

		const courses = app.utils.utils.getCoursesInJson();

		const course = courses.find(p => p.id === id_course);

		if (course) {
			return res.status(200).json(course)
		} else {
			return res.status(400).send('Curso não encontrado!')
		}
	}

	const getTransactionOrdesStatus = async (req, res) => {
		const orderId = req.params.orderId;

		if (orderId) {
			const payment = new Payment(client);
			payment.get({
				id: orderId,
			})
				.then(response => {
					// console.log(response.status)
					return res.status(200).json(response)
				})
				.catch(error => {
					app.config.logger.logger.error('Error fetching transaction status: %O', error.response ? error.response.data : error.message);
					res.status(500).json({ error: 'Error fetching transaction status' });
				});

		} else {
			app.config.logger.logger.error(`ID requerido!`)
			return res.status(400).send('Transaction ID is required.');
		}
	}

	return { createOrder, createOrderPix, getCourse, getTransactionOrdesStatus }
}