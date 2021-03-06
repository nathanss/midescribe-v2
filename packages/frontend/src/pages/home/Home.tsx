import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import CharacteristicsForm from "../../components/sections/CharacteristicsForm";
import Preview from "../../components/sections/Preview";
import "./Home.css";
import { Sequence } from "../../constants/Sequences";
import { SongDescriptorNoteSequenceGenerator } from "../../musicGeneration/SongDescriptorNoteSequenceGenerator";
import { NoteSequence } from "@magenta/music/es6";
import { SongIdeaEntryPoint } from "@midescribe/common";

const backendEndpointUrl =
  process.env.REACT_APP_BACKEND_DESTINATION + "/generateMusicIdea";

function Home() {
  const [showExtractedData, setShowExtractedData] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [description, setDescription] = useState("");
  const [characteristics, setCharacteristics] = useState({
    tempo: 120,
    timeSignature: "4:4",
  });
  
  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_DESTINATION + "/ping", {
      method: "GET"
    });
  }, []);

  async function onFinish() {
    try {
      setRequestOngoing(true);
      const musicIdeaResponse = await fetch(backendEndpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description }),
      }).then((response) => response.json());

      setCharacteristics(musicIdeaResponse);
      setShowExtractedData(true);
      setRequestOngoing(false);
      setIsFillingManually(false);
    } catch (e) {
      setRequestOngoing(false);
      message.error(
        "Something went wrong while communicating with back-end.\nPlease press the Fill manually button."
      );
    }
  }

  const [sequence, setSequence] = useState<any>(Sequence);
  const [isDrum, setIsDrum] = useState(false);
  const [requestOngoing, setRequestOngoing] = useState(false);

  const [isFillingManually, setIsFillingManually] = useState(false);

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
  };

  const onDescriptionSubmit = (songIdea: SongIdeaEntryPoint) => {
    const generator = new SongDescriptorNoteSequenceGenerator(
      songIdea,
      NoteSequence.create
    );
    const sequence = generator.generateNoteSequence();
    setSequence(sequence);
    setIsDrum(songIdea.isDrum!);
    setShowPreview(true);
  };

  const onFillManuallyClick = () => {
    setShowExtractedData(true);
    setIsFillingManually(true);
  };

  return (
    <>
      <div className="site-layout-content">
        <h2>Describe your music idea</h2>
        <Form {...layout} onFinish={onFinish}>
          <Form.Item
            label="Song description"
            name="description"
            tooltip='Please input your song description here. For more information please click on "How to use" on the header'
            rules={[
              { required: true, message: "Please input your description!" },
            ]}
          >
            <Input
              disabled={requestOngoing}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={requestOngoing}>
              Submit
            </Button>
            <Button
              type="default"
              onClick={onFillManuallyClick}
              disabled={requestOngoing}
            >
              Fill manually
            </Button>
          </Form.Item>
        </Form>
      </div>
      {showExtractedData && (
        <div className="site-layout-content">
          {!isFillingManually && (
            <h2>Here's what was recognized from your description</h2>
          )}
          <CharacteristicsForm
            characteristics={characteristics}
            onDescriptionSubmit={onDescriptionSubmit}
          />
        </div>
      )}
      {showPreview && (
        <div className="site-layout-content">
          <h2>Preview</h2>
          <Preview originalSequence={sequence} isDrum={isDrum} />
        </div>
      )}
    </>
  );
}

export default Home;
