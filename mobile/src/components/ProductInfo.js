import React, { Component } from 'react';
import { View, Text, ActivityIndicator, Image, Button } from 'react-native';
import { styles } from './styles.css';
import axios from 'axios';

export default class ProductInfo extends Component {
  static navigationOptions = {
    title: 'Book Info'
  };

  constructor(props) {
    super(props);
    this.state = { isLoading: true, book: {} };
  }

  async componentDidMount() {
    // Query the book database by ISBN code.
    const isbn = this.props.navigation.getParam('barcode', 0);
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    try {
      const res = await fetch(url);
      const results = await res.json();

      if (results.totalItems) {
        // There'll be only 1 book per ISBN
        const book = results.items[0];
        this.setState({
          isLoading: false,
          book
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  saveBook = async () => {
    const bookData = {
      barcode: this.props.navigation.getParam('barcode', 0),
      title: this.state.book.volumeInfo.title,
      subtitle: this.state.book.volumeInfo.subtitle,
      authors: this.state.book.volumeInfo.authors,
      imageUrl: this.state.book.volumeInfo.imageLinks.smallThumbnail
    };

    try {
      await axios.post('http://f042a9f0.ngrok.io/api/books', bookData);

      const { navigate } = this.props.navigation;
      navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { isLoading, book } = this.state;
    const { saveBook } = this;

    if (isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={styles.productContainer}>
        <Image
          source={{ uri: book.volumeInfo.imageLinks.smallThumbnail }}
          resizeMode="contain"
          style={{ width: '100%', height: 200 }}
        />
        <View style={[styles.mBottom2]}>
          <Text style={[styles.text, styles.titleText, styles.mTop2]}>
            {book.volumeInfo.title}
          </Text>
          <Text style={styles.text}>{book.volumeInfo.subtitle}</Text>
          <Text style={[styles.text, styles.titleText, styles.mTop2]}>
            Authors:
          </Text>
          {book.volumeInfo.authors.map(author => (
            <Text key={author} style={styles.text}>
              {author}
            </Text>
          ))}
        </View>
        <Button title="Save Book" onPress={saveBook} />
      </View>
    );
  }
}
