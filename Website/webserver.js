const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('HTML'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/tablesorter', express.static('tablesorter'));
app.use('/font-awesome-4.7.0', express.static('font-awesome-4.7.0'));
app.use('/jquery-ui-1.12.1', express.static('jquery-ui-1.12.1'));

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
});
