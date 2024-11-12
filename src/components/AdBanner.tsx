import React, { useEffect, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';


import mobileAds from 'react-native-google-mobile-ads';



const AdBanner = () => {
    const bannerRef = useRef<BannerAd>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        mobileAds()
            .initialize()
            .then(() => {
                setIsInitialized(true);
            })
            .catch(error => {
                console.error("AdMob initialization error:", error);
            });
    }, []);


    // テスト用の広告ユニットIDを設定
    const adUnitId = __DEV__
    ? (Platform.OS === 'ios'
        ? 'ca-app-pub-3940256099942544/2934735716'  // iOSの開発用テストID
        : TestIds.ADAPTIVE_BANNER)                  // AndroidのテストID
    : (Platform.OS === 'ios'
        ? 'ca-app-pub-5588665107660339/7933010772'  // iOSの本番用広告ユニットID
        : 'ca-app-pub-5588665107660339/9831484560'); // Androidの本番用広告ユニットID


    // iOSではアプリがフォアグラウンドに戻るときに広告を再読み込み
    useForeground(() => {
        if (Platform.OS === 'ios') {
            bannerRef.current?.load();
        }
    });

    return (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <BannerAd
                ref={bannerRef}
                unitId={adUnitId}
                size={BannerAdSize.FULL_BANNER}
            />
        </View>
    );
};

export default AdBanner;
