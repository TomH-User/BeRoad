import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from "../../constants";

const discussions = [
  { id: '1', name: 'BeRoad Team', message: 'Salut, c’est l’équipe BeRoad 😎 On espère que tu...', date: '01/02/2025', link: images.logo },
  { id: '2', name: '+33 6 23 30 52 15', message: 'Photo', date: '31/03/2018', link: 'https://media.motoservices.com/media/cache/slider_lg/media/gallery/11159/ARCHIVE_35.jpg' },
  { id: '3', name: 'JP', message: 'Suis au Mexique avec la famille, j’ai eu ton invita...', date: '26/01/2025', link: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhrbkqmrWLOP7X0i2MeISWb5v0gjVi-NwBng&s' },
  { id: '4', name: 'Sortie Déc 2024 Nanterre', message: 'RiderDu94 est parti(e)', date: '26/01/2025', link: 'https://i.etsystatic.com/18986721/r/il/eb16a2/3592284683/il_fullxfull.3592284683_ralg.jpg' },
  { id: '5', name: 'Pascale Yamaha R6Race', message: 'Photo', date: '27/08/2017', link: 'https://motovlan.be/files/03-2023/ad43423/yamaha-r6-1689188062_large.jpg' },
  { id: '6', name: 'Iroise_Roadster', message: 'slt ! Les Grisou ont la belle vie, ils arrivent pas a...', date: '19/01/2025', link: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLp-WoP1GE4W35lasDP7kXRtvrYCGjlcmSin9qPNv8sUZsJ_u3RZJBrPcSBQubwni5qHc&usqp=CAU' },
  { id: '7', name: '227_ALbionicR', message: 'Photo (4)', date: '12/01/2025', link: 'https://s3-eu-west-2.amazonaws.com/newzimlive/wp-content/uploads/2024/03/25030600/1711335777337.jpg' },
  { id: '8', name: 'El Baroodor', message: 'Non poulet déso mais ce samedi je pourrais que...', date: '29/12/2024', link: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfbDdfuKioghsEaYU_QTkmTUZS0v4v3pB4LDwIGEM6pzgOhLp1JvHjshs4_YOdxwA-RqM&usqp=CAU' },
];

const DiscussionPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filteredDiscussions, setFilteredDiscussions] = useState(discussions);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = discussions.filter(discussion => 
      discussion.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDiscussions(filtered);
  };

  const renderItem = ({ item }: { item: typeof discussions[0] }) => (
    <View style={styles.discussionItem}>
      <Image style={styles.avatar} source={item.id === '1' ? item.link : { uri: item.link }} />
      <View style={styles.messageInfo}>
        <View style={styles.messageHeader}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#888"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredDiscussions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622', // Dark blue color
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  discussionItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#222222',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500', // Orange color
  },
  dateText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default DiscussionPage;