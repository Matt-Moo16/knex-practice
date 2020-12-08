require('dotenv').config()
const knex = require('knex')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

function searchByItemName(searchTerm) {
    knexInstance
    .select('*')
    .from('shopping_list')
    .where('name', 'ILIKE', `%${searchTerm}%`)
    .then(result => {
        console.log(result)
    })
}

searchByItemName('urk')

function paginatItems(pageNumber) {
    const itemsPerPage = 6
    const offset = itemsPerPage * (pageNumber -1)
    knexInstance
    .select('*')
    .from('shopping_list')
    .limit(itemsPerPage)
    .offset(offset)
    .then(result => {
        console.log(result)
    })
}

paginatItems(3)

function itemAddedDaysAgo(daysAgo) {
    knexInstance
    .select('name', 'price', 'category', 'checked')
    .from('shopping_list')
    .where(
       'date_added',
       '>',
       knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo) 
    )
    .then(result => {
        console.log(result)
    })
}

itemAddedDaysAgo(6)

function categoryTotalCost() {
    knexInstance
    .select('category')
    .sum('price as total')
    .from('shopping_list')
    .groupBy('category')
    .then(result => {
        console.log(result)
    })
}

categoryTotalCost()