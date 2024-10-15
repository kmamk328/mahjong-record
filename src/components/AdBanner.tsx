import React, { useRef } from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

const AdBanner = () => {
    const bannerRef = useRef<BannerAd>(null);

    // テスト用の広告ユニットIDを設定
    const adUnitId = __DEV__
        ? TestIds.ADAPTIVE_BANNER // 開発中はテストIDを使用
        : Platform.OS === 'ios'
        ? 'ca-app-pub-3940256099942544/2934735716'  // iOSの本番用広告ユニットID
        : 'ca-app-pub-3940256099942544/6300978111'; // Androidの本番用広告ユニットID

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
