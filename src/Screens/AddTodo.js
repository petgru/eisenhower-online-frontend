/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button,
  Icon,
  ButtonGroup,
} from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import uuid from 'react-native-uuid';
import mime from 'mime-types';

import { colors } from 'theme';
import { API, Storage } from 'aws-amplify';
import files from '../Utils/files';
import awsmobile from '../aws-exports';
import DatePicker from '../Components/DatePicker';

const { width, height } = Dimensions.get('window');

let styles = {};

class AddTodo extends React.Component {
  static navigationOptions = {
    title: 'Add Todo',
  }

  state = {
    selectedUrgencyIndex: 1,
    selectedImportanceIndex: 0,
    modalVisible: false,
    input: {
      title: '',
      description: '',
      due: null,
      open: true,
      urgent: false,
      important: true,
    },
    showActivityIndicator: false,
  }

  updateInput = (key, value) => {
    this.setState((state) => ({
      input: {
        ...state.input,
        [key]: value,
      }
    }))
  }

  updateUrgency = (index) => {
    this.setState((state) => ({
      selectedUrgencyIndex: index,
      input: {
        ...state.input,
        urgent: !index,
      }
    }))
  }

  updateImportance = (index) => {
    this.setState((state) => ({
      selectedImportanceIndex: index,
      input: {
        ...state.input,
        important: !index,
      }
    }))
  }

  AddTodo = async () => {
    const todoInfo = this.state.input;

    //this.setState({ showActivityIndicator: true });

    this.apiSaveTodo(todoInfo)
      .then(data => {
        //this.setState({ showActivityIndicator: false });
        this.props.screenProps.handleRetrieveTodo();
        this.props.screenProps.toggleModal();
      })
      .catch(err => {
        console.log('error saving todo...', err);
        //this.setState({ showActivityIndicator: false });
        alert(err);
      });
  }

  async apiSaveTodo(todo) {
    return await API.post('Todos', '/items/todos', { body: todo });
  }

  render() {
    const { selectedUrgencyIndex, selectedImportanceIndex } = this.state;

    return (
      <View style={{ flex: 1, paddingBottom: 0 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.title}>Add New Todo</Text>
          <FormLabel>Title</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter your todo's title"
            returnKeyType="next"
            ref="title"
            textInputRef="titleInput"
            onChangeText={(title) => this.updateInput('title', title)}
            value={this.state.input.title}
          />
          <FormLabel>Urgency</FormLabel>
          <View style={styles.buttonGroupContainer}>
            <ButtonGroup
              innerBorderStyle={{ width: 0.5 }}
              underlayColor='#0c95de'
              containerStyle={{ borderColor: '#d0d0d0' }}
              selectedTextStyle={{ color: 'white', fontFamily: 'lato' }}
              selectedBackgroundColor={colors.primary}
              onPress={this.updateUrgency}
              selectedIndex={this.state.selectedUrgencyIndex}
              buttons={['Urgent', 'Not urgent']}
            />
          </View>
          <FormLabel>Importance</FormLabel>
          <View style={styles.buttonGroupContainer}>
            <ButtonGroup
              innerBorderStyle={{ width: 0.5 }}
              underlayColor='#0c95de'
              containerStyle={{ borderColor: '#d0d0d0' }}
              selectedTextStyle={{ color: 'white', fontFamily: 'lato' }}
              selectedBackgroundColor={colors.primary}
              onPress={this.updateImportance}
              selectedIndex={this.state.selectedImportanceIndex}
              buttons={['Important', 'Not important']}
            />
          </View>
          <FormLabel>Due date</FormLabel>
          <DatePicker
            inputStyle={styles.input}
            selectionColor={colors.primary}
            value={this.state.input.due}
            ref="datepicker"
            onDateChange={date => this.updateInput('due', date)}>
          </DatePicker>
          <FormLabel>Description</FormLabel>
          <FormInput
            inputStyle={styles.input}
            multiline = {true}
            numberOfLines = {4}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter your todo's description"
            returnKeyType="next"
            ref="description"
            textInputRef="descriptionInput"
            onChangeText={(description) => this.updateInput('description', description)}
            value={this.state.input.description}
          />
        </ScrollView>
        <Button
          fontFamily='lato'
          containerViewStyle={{ marginTop: 20 }}
          backgroundColor={colors.primary}
          large
          title="Add Todo"
          onPress={this.AddTodo}
        />
        <Text
          onPress={this.props.screenProps.toggleModal}
          style={styles.closeModal}>Dismiss</Text>
        <Modal
          visible={this.state.showActivityIndicator}
          onRequestClose={() => null}
        >
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
          />
        </Modal>
      </View>
    );
  }
}

styles = StyleSheet.create({
  buttonGroupContainer: {
    marginHorizontal: 8,
  },
  closeModal: {
    color: colors.darkGray,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    marginLeft: 20,
    marginTop: 19,
    color: colors.darkGray,
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    fontFamily: 'lato',
  },
  activityIndicator: {
    backgroundColor: colors.mask,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default AddTodo;
