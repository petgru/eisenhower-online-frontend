

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  Animated,
  StyleSheet,
  Easing,
  TouchableHighlight,
  SectionList,
  ListItem,
  Modal,
  Alert
} from 'react-native';

import { Button, Icon } from 'react-native-elements';
import { DrawerNavigator, NavigationActions, StackNavigator } from 'react-navigation';

/*https://www.npmjs.com/package/react-native-swipeout-longpressforandroid*/
import Swipeout from 'rc-swipeout';
import ViewMoreText from 'react-native-view-more-text';

import { API, Storage } from 'aws-amplify';
import awsmobile from '../aws-exports';

import AddTodo from './AddTodo';
import ViewTodo from './ViewTodo';
import UploadPhoto from '../Components/UploadPhoto';
import SideMenuIcon from '../Components/SideMenuIcon';

import { colors } from 'theme';

let styles = {};

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.handleRetrieveTodo = this.handleRetrieveTodo.bind(this);
    this.animate = this.animate.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.animatedIcon = new Animated.Value(0);

    this.state = {
      apiResponse: null,
      sectionList: [],
      loading: true,
      modalVisible: false,
    }
  }

  /* State */

  componentDidMount() {
    this.handleRetrieveTodo();
    this.animate();
  }

  animate() {
    Animated.loop(
      Animated.timing(
        this.animatedIcon,
        {
          toValue: 1,
          duration: 1300,
          easing: Easing.linear,
        }
      )
    ).start();
  }

  openDrawer = () => { // eslint-disable-line
    this.props.navigation.navigate('DrawerOpen');
  }

  toggleModal() {
    if (!this.state.modalVisible) {
      this.handleRetrieveTodo();
      this.animate();
    }
    this.setState((state) => ({ modalVisible: !state.modalVisible }));
  }

  /* Data */

  handleRetrieveTodo() {
    API.get('Todos', '/items/todos').then(apiResponse => {
      return Promise.all(apiResponse.map(async (todo) => {
        return { ...todo, };
      }));
    }).then(apiResponse => {
      sectionList = this.createSectionList(apiResponse);
      this.setState({ apiResponse, sectionList, loading: false });
    }).catch(e => {
      this.setState({ apiResponse: e.message, loading: false });
    });
  }

  createSectionList(apiResponse) {
    q1 = []; q2 = []; q3 = []; q4 = [];
    apiResponse.forEach(todo => {
      if (todo.urgent && todo.important) { q1.push(todo); } /*Q1: Urgent and important*/
      else if (!todo.urgent && todo.important) { q2.push(todo); } /*Q2: Not-urgent and important*/
      else if (todo.urgent && !todo.important) { q3.push(todo); } /*Q3: Urgent and not-important*/
      else if (!todo.urgent && !todo.important) { q4.push(todo); } /*Q4: Not-urgent and not-important*/
    });

    return [
      {data: q1, key: "Q1"},
      {data: q2, key: "Q2"},
      {data: q3, key: "Q3"},
      {data: q4, key: "Q4"},
    ];
  }

  /* Actions */

  deleteTodo(todo) {
    Alert.alert(
      'Confirm delete',
      'Do you want to delete todo "'+todo.title+'"',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'OK', onPress: () => 
          API.del("Todos", `/items/todos/${todo.todoId}`)
            .then(todo => {
              this.handleRetrieveTodo();
              /*i = this.state.apiResponse.indexOf(todo);
              apiResponse = this.state.apiResponse.splice(i, 1);
              sectionList = this.createSectionList(apiResponse);
              this.setState({ apiResponse, sectionList, loading: false });*/
            })},
      ],
      { cancelable: true }
    )
  }

  completeTodo(todo) {
    alert('complete');
  }

  /* Render */

  renderTodo(todo) {
    return (
        <Swipeout
          style={styles.todoContainer}
          left={[
            {
              text: 'Complete',
              onPress:() => this.completeTodo(todo),
              style: { backgroundColor: 'green', color: 'white' },
            }
          ]}
          right={[
            {
              text: 'Delete',
              onPress:() => this.deleteTodo(todo),
              style: { backgroundColor: 'red', color: 'white' },
            }
          ]}
        >
          <Text style={styles.todoTitle}>{todo.title}</Text>
            <Text style={styles.todoDescription} numberOfLines={2}>{todo.description}</Text>
        </Swipeout>
    )
  }

  renderNoContent(section) {
    if (section.data.length != 0) { return null }
    else { return (<View><Text style={styles.noTodos}>No {section.key}</Text></View>) }
  }

  render() {
    const { loading, apiResponse } = this.state;
    const spin = this.animatedIcon.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const AddTodoRoutes = StackNavigator({
      AddTodo: { screen: AddTodo },
    });

    return (
      <View style={[{ flex: 1 }]}>
        {!loading && <View style={{ position: 'absolute', bottom: 25, right: 25, zIndex: 1 }}>
          <Icon
            onPress={this.toggleModal}
            raised
            reverse
            name='add'
            size={44}
            containerStyle={{ width: 50, height: 50 }}
            color={colors.primary}
          />
        </View>}

        <ScrollView style={[{ flex: 1, zIndex: 0 }]} contentContainerStyle={[loading && { justifyContent: 'center', alignItems: 'center' }]}>
          {loading && <Animated.View style={{ transform: [{ rotate: spin }] }}><Icon name='autorenew' color={colors.grayIcon} /></Animated.View>}
          {!loading &&
            <SectionList
              renderSectionHeader={({section}) => <View><Text style={styles.listHeader}>{section.key}</Text></View>}
              renderItem={({item}) => this.renderTodo(item)}
              renderSectionFooter={({section}) => this.renderNoContent(section)}
              sections={this.state.sectionList}
              keyExtractor={item => item.todoId}
            />}
        </ScrollView>
        <Modal animationType={"slide"} transparent={false} visible={this.state.modalVisible} onRequestClose={this.toggleModal}>
          <AddTodoRoutes screenProps={{ handleRetrieveTodo: this.handleRetrieveTodo, toggleModal: this.toggleModal }} />
        </Modal>
      </View >
    );
  }
};

styles = StyleSheet.create({
  container: {
    padding: 25,
  },
  title: {
    color: colors.darkGray,
    fontSize: 18,
    marginBottom: 15,
  },
  listHeader: {
    color: colors.lightGray,
    backgroundColor: colors.darkGray,
    fontSize: 20,
    padding: 5,
    paddingLeft: 17
  },
  todoContainer: {
    marginVertical: 10,
    backgroundColor: 'transparent',
    flexDirection: 'column',
  },
  todoTitle: {
    color: colors.darkGray,
    fontSize: 20,
    marginLeft: 17
  },
  todoDescription: {
    color: colors.darkGray,
    fontSize: 14,
    marginLeft: 17
  },
  noTodos: {
    color: colors.darkGray,
    fontStyle: 'italic',
    fontSize: 14,
    padding: 20,
  },
})



const HomeRouteStack = {
  Home: {
    screen: (props) => {
      const { screenProps, ...otherProps } = props;
      return <Home {...props.screenProps} {...otherProps} />
    },
    navigationOptions: (props) => {
      return {
        title: 'Home',
        headerLeft: <SideMenuIcon onPress={() => props.screenProps.rootNavigator.navigate('DrawerOpen')} />,
      }
    }
  },
  ViewTodo: { screen: ViewTodo }
};

const HomeNav = StackNavigator(HomeRouteStack);

export default (props) => {
  const { screenProps, rootNavigator, ...otherProps } = props;

  return <HomeNav screenProps={{ rootNavigator, ...screenProps, ...otherProps }} />
};
