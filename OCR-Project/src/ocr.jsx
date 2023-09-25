import { Button, Input } from '@mui/base';
import Textarea from '@mui/joy/Textarea';
import Typography from '@mui/material/Typography'
import React, { useState, useRef, useEffect } from 'react';
import { Box, LinearProgress, Stack } from '@mui/material';
import { positions } from '@mui/system'
import Tesseract from 'tesseract.js'
import { red } from '@mui/material/colors';
// import preprocessImage from './preprocess'

{/* UI components */ }
function LinearProgressWithLabel(props) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}

export default function Ocr() {
    const [isLoading, setIsLoading] = useState(false);
    const [text, setText] = useState("");
    const [lines, setLines] = useState([]);
    const [progress, setProgress] = useState(0);
    const canvasRef = useRef(null)


    const drawBoundBox = (x0, x1, y0, y1) => {
        const context = canvasRef.current.getContext("2d");
        context.strokeStyle = "red";
        context.lineWidth = 2;
        let width = x1 - x0;
        let height = y1 - y0;
        context.strokeRect(x0, y0, width, height);
    }

    useEffect(() => {
        lines.forEach((line) => {
            let bbox = line['bbox'];
            drawBoundBox(bbox.x0, bbox.x1, bbox.y0, bbox.y1);
        })
        drawBoundBox();        
    }, [lines])

    const handleClick = () => {
        setIsLoading(true);

        const canvas = canvasRef.current
        {/* Possible preprocessing methods */ }

        // ctx.putImageData(preprocessImage(canvas), 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");

        Tesseract.recognize(
            dataUrl,
            // image,
            'eng',
            {
                logger: m => {
                    console.log(m);
                    if (m.status === "recognizing text") {
                        setProgress(parseInt(m.progress * 100))
                    }
                },
            }).then(({ data: { text, lines} }) => {
                setText(text);
                setLines(lines);
                console.log(lines);
                setIsLoading(false);
            });
    }

    return (
        <Stack
            direction='column'
            spacing={{ xs: 1, sm: 2, md: 4 }}
            alignItems="center"
        >
            {!isLoading &&
                <Typography
                    variant='h2'
                    sx={{ width: 'auto', mt: 5, mb: 4 }}>
                    Image to Text
                </Typography>}

            {/* Image */}
            {
                <canvas ref={canvasRef}></canvas>
            }

            {/* form */}
            {
                !isLoading && !text && (
                    <>
                        <Input
                            type="file"
                            accept="imge/*"
                            className="form-control"
                            sx={{ width: 'auto' }}
                            onChange={
                                (e) => {
                                    let imageFile = e.target.files[0];
                                    var reader = new FileReader();
                                    reader.readAsDataURL(imageFile);
                                    reader.onloadend = (e) => {
                                        var img = new Image();

                                        img.onload = function () {
                                            var canvas = canvasRef.current;
                                            var canvasContext = canvas.getContext("2d");
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            canvasContext.drawImage(img, 0, 0)
                                        }
                                        img.src = e.target.result;
                                        // setImage(e.target.result)
                                    }
                                }
                            }
                        />
                        <Button
                            variant="outlined"
                            style={{ minWidth: '100%' }}
                            sx={{ mt: 4 }}
                            onClick={handleClick}>
                            Convert
                        </Button>
                    </>
                )}

            {/* Progress Bar */}
            {
                isLoading && (
                    <>
                        <LinearProgressWithLabel
                            variant="determinate"
                            value={progress}
                            style={{ width: '50vw' }}
                        />
                    </>
                )
            }

            {/* Text Area */}
            {
                !isLoading && text && (
                    <Textarea
                        className="form-control"
                        sx={{ width: '100%' }}
                        rows="30"
                        onChange={(e) =>
                            setText(e.target.value)}
                        value={text}
                    />
                )
            }
        </Stack>
    )
}