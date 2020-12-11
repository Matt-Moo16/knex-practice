const ShoppingListService = require('../src/shopping-list-service');
const knex = require('knex');
const { expect } = require('chai');

describe(`Shopping List Service object`, function () {
    let db;
    let testItems = [
        {
            id: 1,
            name: 'First Test Item',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            price: '13.00',
            category: 'Main'
        },
        {
            id: 2,
            name: 'Second Test Item',
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            price: '9.00',
            category: 'Lunch'
        },
        {
            id: 3,
            name: 'Third Test Item',
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            price: '25.00',
            category: 'Breakfast' 
        },
        {
            id: 4, 
            name: 'Fourth Test Item',
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            price: '0.89',
            category: 'Breakfast'
        }
    ];

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
    });

    before(() => db('shopping_list').truncate());

    afterEach(() => db('shopping_list').truncate());

    after(() => db.destroy());

    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db 
                .into('shopping_list')
                .insert(testItems)
        });

        it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
           return ShoppingListService.getAllItems(db)
           .then(actual => {
               expect(actual).to.eql(testItems)
           });
        });

        it(`getById() resolves an article by id from 'shopping_list' table`, () => {
            const thirdId = 3
            const thirdTestItem = testItems[thirdId - 1]
            return ShoppingListService.getById(db, thirdId)
            .then(actual => {
                expect(actual).to.eql({
                    id: thirdId,
                    title: thirdTestItem.name,
                    date_added: thirdTestItem.date_added,
                    price: thirdTestItem.price,
                    category: thirdTestItem.category,
                    checked: false,
                });
            });
        });

        it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
            const idToDelete = 3;
            return ShoppingListService.deleteItem(db, idToDelete)
            .then(() => ShoppingListService.getAllItems(db))
            .then(allItems => {
                const expected = testItems
                .filter(item => item.id !== idToDelete)
                .map(item => ({
                    ...item, 
                    checked: false,
                }));
                expect(allItems).to.eql(expected)
            });
        });
        it(`updateItem() updates an item in the 'shopping_list' table`, () => {
            const idOfItemToUpdate = 3;
            const newItemData = {
                name: 'Updated Title',
                price: '50.00',
                date_added: new Date(),
                checked: true,
            };
            const originalItem = testItems[idOfItemToUpdate - 1];
            return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
                .then(item => {
                    expect(item).to.eql({
                        id: idOfItemToUpdate,
                        ...originalItem,
                        ...newItemData
                    });
                });
        });   
    });

    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolves an empty array`, () => {
            return ShoppingListService.getAllItems(db)
            .then(actual => {
                expect(actual).to.eql([]);
            });
        });

        it(`insertItem() inserts an item and resolves it with an 'id'`, () => {
            const newItem = {
                name: 'Test New Name',
                price: '6.45',
                date_added: new Date('2020-06-06T00:00:00.000Z'),
                checked: true,
                category: 'Snack'
            };
            return ShoppingListService.insertItem(db, newItem)
            .then(actual => {
                expect(actual).to.eql({
                    id: 1, 
                    name: newItem.name,
                    price: newItem.price,
                    date_added: newItem.date_added,
                    checked: newItem.checked,
                    category: newItem.category,
                });
            });
        });
    });
});