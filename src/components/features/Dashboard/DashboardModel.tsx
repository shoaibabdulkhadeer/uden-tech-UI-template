import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import React, { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three';
useGLTF.preload("/assets/images/scene.glb");


const DashboardModel = () => {


    useEffect(() => {
        return () => {
            THREE.Cache.clear(); // Optional cleanup
        };
    }, []);


    function Model({ modelPath }: any) {
        const modelRef: any = useRef();
        const { scene, animations }: any = useGLTF(modelPath); // Load the model
        const { actions }: any = useAnimations(animations, scene);

        useEffect(() => {
            if (actions && Object?.keys(actions).length > 0) {
                const action = actions[Object?.keys(actions)[0]];
                action.setLoop(THREE?.LoopRepeat);
                action.play();
            }
        }, [actions]);

        useFrame(() => {
            if (modelRef.current) {
                modelRef.current.rotation.y += 0.01;
                // modelRef.current.rotation.x += 0.01;
            }
        });

        // eslint-disable-next-line react/no-unknown-property
        return <primitive object={scene} ref={modelRef} scale={70.5} position={[0, -57, 5]} castShadow />;
    }

    return (
        <div>
            <Suspense fallback={<div>Loading 3D model...</div>}>
                <Canvas camera={{ position: [5, 5, 5], fov: 45 }} style={{ width: '140px', height: '180px' }} shadows>

                    {/* eslint-disable-next-line react/no-unknown-property */}
                    <ambientLight intensity={0.5} />
                    {/* eslint-disable-next-line react/no-unknown-property */}
                    <directionalLight position={[3, 10, 5]} intensity={5} castShadow />
                    {/* eslint-disable-next-line react/no-unknown-property */}
                    <Model modelPath="/assets/images/scene.glb" />
                    {/* eslint-disable-next-line react/no-unknown-property */}
                    <OrbitControls
                        makeDefault
                        enableZoom={true}
                        maxDistance={190}
                        minDistance={155}
                        // maxDistance={440}
                        // minDistance={473}
                        target={[5, 0, 0.01]}
                        enableDamping={true} />
                </Canvas>
            </Suspense>
        </div>
    )
}

export default DashboardModel